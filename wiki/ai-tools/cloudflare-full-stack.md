# Cloudflare 全栈实战指南：建站、邮箱、存储、Workers AI 与 cf Agent 运维

<!--
内容元数据:
source_raw_files:
  - raw/万字长文｜Cloudflare 从入门到精通，一个域名搞定建站、邮箱、存储和 AI 后端.md
domain: ai-tools
created: 2026-10-09
updated: 2026-10-09
tags: cloudflare, workers, r2, email-routing, workers-ai, clef, cf-cli, dns, ssl-tls, agent-infrastructure, ai-crawler, zero-egress
related:
  - wiki/ai-tools/kitesurf-agent-browser.md
  - wiki/machine-native-intelligence/system-one-models.md
  - wiki/ai-security/agent-sandbox.md
  - wiki/dev-toolchain/bun-1-4.md
-->

## 摘要

以单个域名为主线，梳理 Cloudflare 面向个人开发者与 AI Agent 的全栈基础设施能力：从基础层（DNS 解析代理、SSL/TLS 加密防重定向循环）、服务层（Workers 静态建站、Email Routing 免费收信转发、R2 对象存储与 0 出站流量费）、安全层（AI Crawl Control 爬虫管控与 AI 迷宫消耗机制），到计算与模型层（Workers 无服务器后端、Workers AI 免 GPU 调用 Gemma 4、以及 2026 年 10 月发布的 Clef/Clef-flash 概率决策模型）。最后聚焦 Cloudflare 全新面向 Agent 设计的 `cf` CLI，提炼自然语言命令检索、`--dry-run` 预览、`--force` 防误删保护与 `AGENTS.md` 引导规范，构成一套闭环的个人云端与 Agent 运维基础设施。

---

## 要点

- **三层价值模型**：网站入口（DNS/CDN/HTTPS）、开发者平台（Workers/R2/KV/D1）、Agent 基础设施（Workers AI/Clef 决策模型/`cf` CLI）。
- **DNS 代理（橙色云）与仅解析（灰色云）分流**：网页走橙色云享受 CDN 与隐藏源站 IP；SSH 连接、邮件服务器 A 记录及自定义端口必须保持灰色云（仅 DNS），否则网络阻断。
- **SSL/TLS 模式防踩坑**：首选“自动”或“完整（严格）”；切忌在源站开启 HTTP 跳转 HTTPS 时在 Cloudflare 侧使用“灵活（Flexible）”模式，否则会导致无限重定向循环（ERR_TOO_MANY_REDIRECTS）。
- **静态建站入口升级**：官方 Pages 工作流已向 Workers 体系收拢，GitHub 仓库直连构建部署，静态资源请求免费且不限量，支持自动分配证书并绑定自定义域名。
- **Email Routing 邮件路由**：免费实现自定义域名邮箱（如 `hi@example.com`）接收并转发至常用邮箱，支持多前缀规则与 Catch-all 全收；发信功能（Email Sending）仍在 Beta。
- **R2 对象存储出站 0 资费**：每月 10 GB 免费标准存储，核心优势在于**出站流量完全免费**；必须绑定自定义域名（如 `img.example.com`）以获得 CDN 缓存与稳定性，禁用带速率限制的开发级 `r2.dev` 地址。
- **AI 爬虫治理与 AI 迷宫**：通过 AI Crawl Control 区分并针对性放行（搜索引擎）或拦截（训练爬虫，支持 403 或 402 付费）；AI 迷宫（AI Labyrinth）通过注入隐藏 nofollow 链接消耗不规范爬虫资源，其性质是“拖住”而非物理拦截。
- **Workers AI 与 Clef 决策模型**：每天 10,000 Neurons 免费额度；开源的 Clef（Qwen 3.8 27B）与 Clef-flash（Qwen 3.5 9B，中位延迟仅 39ms）专为 Agent 路由与分类设计，只输出离散概率分布，无多余文本生成。
- **面向 Agent 的 `cf` CLI**：覆盖 3,000+ API 操作；输出原生结构化 JSON；支持自然语言搜索命令（`cf cli search`）；通过 `--dry-run` 强制预检；非交互模式下删除必须显式附带 `--force`，否则输出 `Aborted.` 静默中止。

---

## 详细内容

### 1. Cloudflare 架构定位与免费额度

Cloudflare 位于终端访客与源服务器之间，承担反向代理、边缘计算与安全网关职责。针对独立开发者与个人使用，免费版额度足以支撑个人主页、博客、图床、API 与轻量 AI 工具的长期运行：

| 服务 | 免费配额（截至 2026 年 10 月） | 适用场景与限制注意 |
| --- | --- | --- |
| **Workers** | 100,000 次请求/天，单次 10ms CPU 时间；静态请求免费且无上限 | CPU 时间仅计纯计算耗时，I/O 与网络等待不计入 |
| **R2 对象存储** | 10 GB 存储/月，100 万次 A 类写入、1000 万次 B 类读取；**出站流量免费** | 免费额度仅适用于标准存储（Standard），不含低频访问存储 |
| **Workers AI** | 10,000 Neurons/天 | 适用于无 GPU 场景下的短问答、分类、嵌入生成 |
| **Email Routing** | 域名邮件接收与转发无限制 | 仅负责收信与转发，不含成熟的 SMTP 发信能力 |
| **Workers KV** | 10 万次读取/天，1,000 次写入/天，1 GB 存储容量 | 适合低频写入、高频读取的配置与键值缓存 |
| **D1 数据库** | 500 万行读取/天，10 万行写入/天，5 GB 存储容量 | 基于 SQLite 的边缘关系型数据库 |

---

### 2. 域名接入、DNS 代理与 SSL/TLS 配置规范

#### 2.1 域名接入与 DNSSEC 预处理
- 接入时选择 Free 计划，Cloudflare 会自动扫描现有 DNS 记录。
- **关键先决条件**：若域名注册商（Namecheap、Spaceship、阿里云等）开启了 DNSSEC，**切换 Nameservers 之前必须先关闭 DNSSEC**。带旧 DNSSEC 切换可能导致全网解析暂时瘫痪；待 Cloudflare 托管生效后，可在控制台重新开启。
- 补齐扫描遗漏的 MX、SPF、DKIM 记录，防止邮件服务中断。

#### 2.2 橙色云（已代理）与灰色云（仅 DNS）策略
- **已代理（橙色云）**：流量经 Cloudflare 边缘节点，启用 CDN 缓存、WAF、DDoS 防护并隐藏源服务器真实 IP。用于网站主域（`example.com`）与 `www` 等 HTTP/HTTPS 业务。
- **仅 DNS（灰色云）**：直接返回解析 IP，直连源站。以下场景**必须**保持灰色云：
  - 用于 SSH 登录与服务器运维面板的子域名（如 `ssh.example.com`），因为代理仅转发 HTTP/HTTPS 端口。
  - 自建邮件服务器的 A 记录（如 `mail.example.com`），开启代理会导致邮件投递失败。
  - 直连数据库端口或特殊 TCP/UDP 游戏服务端口。
- **最佳实践**：业务网站解析绑定橙色云，服务器管理与直连服务配置独立的灰色云二级域名。

#### 2.3 SSL/TLS 加密模式与重定向循环排查
SSL/TLS 模式定义的是“Cloudflare 边缘节点与源服务器之间”的连接行为：

```
[访客] <--- HTTPS (默认) ---> [Cloudflare 边缘] <--- 加密模式选择 ---> [源服务器]
```

- **自动 SSL/TLS**（推荐）：Cloudflare 自动探测并协商源站支持的最高安全级别。
- **完整（严格）Full (Strict)**：源站需配置受信任的 CA 证书（如 Let's Encrypt 或 Cloudflare Origin CA），全链路验证。
- **完整 Full**：使用 HTTPS 连接源站，但不严格校验证书签名（允许自签名证书）。
- **灵活 Flexible**：Cloudflare 到源站使用明文 HTTP 连接。
  - **高危陷阱**：若源服务器配置了强制 HTTP 跳转 HTTPS，而 Cloudflare 设置为“灵活”模式，将导致源站重定向至 HTTPS -> 边缘又以 HTTP 发起请求 -> 陷入无限重定向，浏览器报错 `ERR_TOO_MANY_REDIRECTS`。修复方案为切换为“完整”或“完整（严格）”。
- **边缘证书开关**：在“边缘证书”中开启“Always Use HTTPS（始终使用 HTTPS）”，确保边缘直接收敛非加密 HTTP 流量。

---

### 3. 内容、邮箱与存储基础设施

#### 3.1 基于 Workers 体系发布静态站点
Cloudflare 已将旧版 Pages 体系整合至 Workers：
1. **GitHub 仓库导入**：授权指定仓库，纯 HTML 项目无需构建命令，静态框架（Astro、VitePress、Hugo 等）配置对应的 Build Command 与输出目录。
2. **部署机制**：底层由 `npx wrangler deploy` 驱动，每次推送至 `main` 分支触发边缘自动化构建部署。
3. **域名绑定**：在项目的“自定义域和路由”直接绑定根域名或子域名，同账号下 DNS CNAME 记录自动完成配置与证书签发。

#### 3.2 Email Routing 域名邮箱收发架构
- **核心机制**：托管域名 MX 记录后，Cloudflare 截获发往 `@example.com` 的邮件，并按规则路由转发至外部真实邮箱（Gmail/Outlook/QQ）。
- **配置步骤**：
  1. 激活 Email Routing 并一键添加 MX/SPF/DKIM DNS 记录。
  2. 在“目标地址”添加接收邮箱并完成邮件确认链接验证。
  3. 配置路由规则：指定前缀（如 `hi@`、`contact@`）指向已验证目标，或启用 Catch-all（全收）捕获所有未定义别名。
- **边界说明**：Email Routing 仅负责接收转发；对外发信（Email Sending）仍处在 Beta 阶段。

#### 3.3 R2 对象存储与 0 出站流量费实践
- **成本优势**：区别于传统云厂商昂贵的出站公网流量费，R2 的**出站下载流量完全免费（0 Egress Fee）**。
- **存储桶创建**：名称全局永久唯一不可更改，存储类必须保持“标准（Standard）”（低频访问存储不计入免费配额）。
- **公开访问配置**：
  - **严禁直接依赖公共开发 URL（`r2.dev`）**：`r2.dev` 具备严格的速率限制且不支持缓存，仅用于调试。
  - **生产必须配置自定义域**：绑定二级域名（如 `img.example.com`），自动挂载 CDN 边缘缓存与访问控制。
  - **信息安全**：S3 兼容端点 URL 中包含账户 ID，公开分享代码或截图时需进行脱敏处理。

---

### 4. AI 时代的流量治理与安全策略

#### 4.1 AI Crawl Control
Cloudflare 在控制台提供 AI 爬虫的全局视图与分类治理：
- **监控维度**：列出 OpenAI（ChatGPT-User 等）、Anthropic、ByteDance、Common Crawl、Google 等主流运营商爬虫请求频次。
- **处理策略**：
  - **放行（Allow）**：对带搜索流量归因的爬虫（如用于实时搜索召回的 Bot）予以放行。
  - **拦截（Block）**：对纯数据训练抓取，可配置返回 HTTP 403（禁止访问）或 HTTP 402（Payment Required 付费抓取）。

#### 4.2 AI 迷宫（AI Labyrinth）防御原理
- **作用对象**：针对伪造 User-Agent 或无视 `robots.txt` 的未受控自动化爬虫。
- **实现机制**：向 HTML 中动态植入普通用户不可见、但爬虫遍历可见的合成 `nofollow` 链接，引诱自动化爬虫进入由 AI 生成的无限环路。
- **关键认知**：AI 迷宫是“消耗与拖延”战术，并不阻断初始请求；若需硬拦截恶意流量，仍需通过 WAF 自定义规则与 IP/国家/速率限制进行阻断。

---

### 5. Workers 计算与 Workers AI

#### 5.1 Workers 动态计算与存储组合
- 无需管理服务器或容器，JavaScript/TypeScript 代码在边缘 V8 Isolates 中按需执行。
- 搭配状态存储：KV 适合全局只读或低频写缓存；D1 适合基于 SQL 的表格化关系查询。

#### 5.2 Workers AI 原生大模型调用
- 在 Worker 设置中绑定 `Workers AI`（环境变量命名为 `env.AI`）。
- 无需 GPU 显卡与第三方 API Key，直接调用开源模型：

```javascript
export default {
  async fetch(request, env) {
    const answer = await env.AI.run("@cf/google/gemma-4-26b-a4b-it", {
      messages: [
        { role: "system", content: "你是一个回答简洁的中文助手。" },
        { role: "user", content: "用两句话解释 CDN 是什么。" },
      ],
      chat_template_kwargs: { enable_thinking: false },
    });
    return Response.json(answer);
  },
};
```

#### 5.3 Clef / Clef-flash 决策模型（2026-10 新特性）
为消除大语言模型“生成冗长文本再解析回结构化决策”的效率浪费，Cloudflare 发布了面向 Agent 分流的开源概率决策模型：

- **Clef**：底座为 Qwen 3.8 27B，支持 64K 上下文与多模态图片输入，中位延迟约 209ms。
- **Clef-flash**：底座为 Qwen 3.5 9B，中位延迟仅约 39ms，主打极限速度。
- **核心机制**：接收输入状态与可选列表，直接输出候选选项的离散概率分布，下游程序可直接依据概率阈值进行硬路由，契约设计高度契合 [[machine-native-intelligence/system-one-models|System One 决策模型]]。

---

### 6. 面向 Agent 的 `cf` CLI 运维体系

随着 Agent 调用 CLI 占比接近 50%，Cloudflare 于 2026 年 9 月末发布了专为 Agent 交互优化的新一代命令行工具 `cf`（逐步接替 Wrangler）：

```
[Claude Code / Codex / Pi]
        │
        ▼ (自然语言指令)
  cf cli search "create D1 database"
        │
        ▼ (dry-run 预检 Payload)
  cf d1 create --name db --dry-run
        │
        ▼ (带保护执行，删除须 --force)
  cf d1 create --name db
```

#### 6.1 `cf` 与 Wrangler 的核心差异
- **覆盖度**：Wrangler 聚焦 Workers（~280 路径），`cf` 覆盖全量 Cloudflare API 的 3,000+ 操作（DNS、R2、Email、WAF 等）。
- **机器友好**：输出原生结构化 JSON，支持自然语言检索指令。

#### 6.2 Agent 核心操作范式
1. **指令搜索与 Schema 查询**：
   ```bash
   cf cli search "create D1 database"  # 模糊检索匹配的命令
   cf schema d1 create                 # 获取命令严格参数定义
   ```
2. **强制预检（Dry Run）**：
   ```bash
   cf d1 create --name my-database --dry-run
   ```
   打印即将发出的 HTTP 方法、接口路径与请求体，确认无误再提交执行。
3. **非交互模式破坏性操作保护**：
   Agent 在非交互脚本中执行删除类命令，**若未显式携带 `--force`，命令将直接输出 `Aborted.` 并拒绝执行**。
   > [!WARNING]
   > 处于安全保护机制时，`cf` 的退出码依然为 0。自动化 Agent 脚本在执行删除后，必须通过二次查询（`get` / `list`）验证资源是否真正被清理。

#### 6.3 Agent 配置引导与安全凭证
- **Prompt 引导规则**：在 `AGENTS.md` 或 `CLAUDE.md` 中注入官方推荐配置：
  ```markdown
  When interacting with Cloudflare, use the cf CLI unless the project has a Wrangler configuration file.
  ```
- **Token 权限最小化**：
  - 严禁授予 Global API Key 或跨所有 Zone 的超级权限；
  - 仅按需勾选特定 Zone 与特定资源（如仅 DNS 编辑、仅 R2 读写）；
  - 设置 Token 过期时间并隔离于环境变量 `CLOUDFLARE_API_TOKEN`。

---

### 7. 故障排查速查与决策链路

#### 7.1 六大经典故障诊断

| 故障现象 | 根因诊断方向 | 首选处置动作 |
| --- | --- | --- |
| **重定向次数过多 (ERR_TOO_MANY_REDIRECTS)** | SSL/TLS 设置为“灵活”，而源站强制 HTTPS 跳转 | 将 SSL/TLS 模式改为“自动”、“完整”或“完整（严格）” |
| **域名长时间未激活** | 注册商 NS 记录未更新，或旧 DNSSEC 未关闭导致验证阻断 | 核对两组 NS 地址，先行关闭注册商 DNSSEC 并等待全网传播 |
| **接入后域名无法收信** | DNS 自动扫描遗漏了原有的 MX/SPF 记录，或与 Email Routing 冲突 | 核对旧解析记录补全 MX/TXT，或检查 Email Routing DNS 告警 |
| **无法通过域名 SSH 登录服务器** | 该子域名的 DNS 记录开启了橙色云（已代理） | 将该记录改为灰色云（仅 DNS），或直接使用 IP/专用子域连接 |
| **R2 图片加载极慢或报 429** | 生产环境使用了开发临时地址 `r2.dev` | 为存储桶绑定自定义域名（`img.example.com`），走 CDN 缓存 |
| **Worker 运行报超出 CPU 限制** | 单次请求执行了密集计算或死循环（超 10ms CPU 限制） | 将重计算逻辑移出或拆解，注意外部 fetch 等待不计入 CPU |

#### 7.2 个人基础设施落地决策链路
```
1. 域名接入 Cloudflare (配置 DNS 代理与 Full Strict HTTPS)
   │
   ├─► 2. 静态建站需求: Workers 导入 GitHub 仓库并绑定域名
   │
   ├─► 3. 专属邮箱需求: 开启 Email Routing，配置前缀并转发至主邮箱
   │
   ├─► 4. 图床/存储需求: 创建 R2 存储桶，绑定自定义二级域名 (0 出站费)
   │
   ├─► 5. 动态接口需求: 编写 Worker 脚本；需持久化时挂载 KV / D1
   │
   ├─► 6. 边缘 AI 需求: Worker 绑定 Workers AI (Gemma 4 / Clef 决策路由)
   │
   └─► 7. 自动化运维: 配置 cf CLI，在 AGENTS.md 引导 Agent 接管，最小化 Token 权限
```

---

## 来源备注

| 原始文件 | 位置 | 备注 |
|----------|------|------|
| [[raw/万字长文｜Cloudflare 从入门到精通，一个域名搞定建站、邮箱、存储和 AI 后端.md\|Cloudflare 入门到精通长文]] | raw/ | 作者 @xiaomovps，2026-10-09 发布，系统性串联域名、DNS、SSL、Workers 建站、Email Routing、R2 存储、AI 爬虫治理、Workers AI、Clef 决策模型与 cf CLI |
