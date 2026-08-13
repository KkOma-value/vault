# 本地优先 AI 工具链落地报告：从自动化范式到 Agent 装备

<!--
输出元数据:
type: report
generated: 2026-08-14
source_wiki_files:
  - wiki/ai-automation/wechat-group-daily.md
  - wiki/pi-agent/pi-extensions-and-sdk.md
  - wiki/ai-security/agent-sandbox.md
  - wiki/ai-tools/aihot-agent-skill.md
  - wiki/ai-tools/kitesurf-agent-browser.md
  - wiki/overseas-access/esim-us-number.md
source_raw_files:
  - raw/微信群日报工具：每天晚上10点，自动把群聊变成一页PDF.md
  - raw/Pi 代理 101 - 如何扩展和构建自己的线束.md
  - （代码库）long-agent/src/long/sandbox/
  - raw/Agent 接入.md
  - raw/Introducing Kitesurf The agent-first browser that runs in V8 isolates on Cloudflare Workers.md
  - raw/国行手机用上 eSIM + 最便宜的美国号，保姆级教程手把手带你搞定.md
tags: ai-automation, local-first, 工具链, agent-sandbox, skills, agent-browser, esim
-->

## 报告摘要

把 AI 从"聊天框"搬进"自己的工作流"，是知识库另一条清晰的落地主线。本报告整合 6 份资料，回答一个问题：**想在本地电脑上稳定、安全、自动化地跑 AI 代理，需要哪些零件、遵循什么范式？** 结论：一套完整的本地优先工具链 = 自动化范式（只读 + 定时 + 脱敏 + 凭据隔离）+ 执行安全（沙箱约束）+ 可扩展的 Agent 内核（Pi 式扩展/SDK）+ 外部能力接入（Skill、Agent 浏览器）+ 基础设施（海外号等验证门槛）。

---

## 一、自动化范式：AI 真正有价值的地方是嵌入工作流

微信群日报工具（wechat-group-daily）示范了一类可复用的本地 AI 自动化范式，四条原则：

1. **只读 + 定时**：从已有数据源（本地数据库/日志/邮件）只读抓取，用系统级定时器（Mac launchd / Windows 任务计划程序）无人值守触发——它**不是微信机器人**，不发消息、不改记录，只从微信本地数据库只读提取。
2. **脱敏前置**：敏感数据（手机号/邮箱/身份证）在离开本机前先在本地脱敏，只把处理后内容发给第三方模型。
3. **凭据隔离**：API Key 进系统凭据库（Mac 钥匙串 / Windows 凭据管理器），不落配置文件、不进终端输出/截图。
4. **产出双格式**：机器可续处理的 Markdown + 人可直接读/转发的 PDF（A4 一到两页的"行动报告"而非聊天记录复制）。

> 采纳建议：把"工具本身"与"作者自营的付费中转"分开评估（默认模型调用走商业中转属作者变现入口，非工具运行必要条件，可自行替换 API 端点）。自动脱敏无法识别所有商业秘密与个人信息，高敏内容群不建议发给任何第三方模型。

---

## 二、执行安全：把 Agent 放进真实目录前，先上边界

本地自动化最大的风险是"Agent 直接在真实工作区执行命令"。Long Agent 的原地沙箱（in-place process sandbox）给出了默认防护范式：

- **不建容器、不建 worktree**：进程跑在宿主机上、以你的用户身份运行，靠 **Seatbelt（macOS）/ Bubblewrap（Linux）+ 资源限制 + 应用层路径策略**约束"它能碰到什么"。
- **文件策略 deny-then-reallow**：先 deny 根与敏感目录，再只 re-allow 系统根 + 工作区 + 会话目录；写只给工作区 + 会话目录；.git、.env、宿主 shell rc 全 deny-write。
- **网络走可信回环代理**：域名白/黑名单 + 私有网段硬 deny（防 SSRF 打本机/内网），DNS 结果再校验。
- **合成 HOME + 凭据 env 全拉黑**：PATH 最小化，API Key / GITHUB_TOKEN / DATABASE_URL 等一律不可见，缓存重定向会话目录。
- **fail-closed**：每 turn 启动前跑策略探测，任何一步不过就拒绝该 turn；strict 下后端不可用就拒绝启动，绝不静默降级成裸奔。
- **边界认知**：npm postinstall 脚本仍以宿主用户身份执行（程序从宿主借、状态被隔离）——要连这层一起隔离需要真正的容器后端（当前是占位）。

---

## 三、Agent 内核：极简 + 一切可扩展（Pi 模式）

要自建本地代理而非只调现成工具，Pi 框架是"默认极简、靠扩展添加一切能力"的范本：

- 默认只有 4 个工具（bash/read/write/edit），其他全部通过 **TypeScript 扩展**添加；三个对象暴露几乎所有挂钩点：pi.*（注册能力）、pi.on(event)（生命周期钩子）、ctx.*（实时会话）。
- **/reload 热重载**：代理可在运行时重写自己的框架；Pi 理解自己的扩展 API，可直接用自然语言让它自己写扩展。
- **钩子可拦截上下文**：pi-hypa 用钩子清理 bash 输出，token 削减 80%~98%，代理无感知——这是"上下文预算"的工程化手段。
- **SDK 化**：五包 SDK（pi-ai / pi-agent / pi-coding-agent / TUI / orchestrator），整个代理可坍缩为一次函数调用；资源加载器（resource loader）为每个 session 划定范围（每用户沙箱 cwd + 显式注入工具），多租户后端 SessionManager.inMemory() 以自有 DB 为事实源。
- **权限门模式**：pi.on("input") 在 prompt 到达代理前用一次廉价模型调用按策略分类 allow/deny——策略即代码，如"只有 Jason 能看营收数据"。

---

## 四、外部能力接入：Skill 与 Agent 浏览器

### Agent Skills（以 AI HOT 为例）

- 安装方式：让 Agent 读取 aihot.virxact.com/aihot-skill/README.md 并安装 Skill，即获得匿名只读公开 API（中文 AI 资讯精选、7 天动态、AI 日报），无需 API Key。
- 工程细节：条件轮询（If-None-Match）控制速率；429 按 Retry-After 退避；API 有迁移窗口（/api/public/* 2026-12-31 停服）；v1 契约不删字段但不承诺 SLA——需自行设置缓存、重试与降级。
- 注意：摘要/翻译由 AI 生成，引用数字/政策/原话前需通过原文 URL 复核；对外发布保留 attribution。

### Agent 浏览器（以 Cloudflare Kitesurf 为例）

- 定位：Agent-first、无状态浏览器，跑在 Workers（V8 isolates）上；CPU/内存开销比 Chromium 低 3~7×，按需启动、会话隔离。
- 能力边界：网页截图/PDF、HTML/结构化内容提取、大规模并发短生命周期会话；不支持视频/WebGL/TLS 指纹协商；每次页面加载视为不信任输入，网络统一经 SandboxOutbound 代理。
- 接入：Browser Run API（browser=kitesurf 参数）、Quick Actions、CDP WebSocket；Puppeteer/Playwright/MCP 客户端直接兼容。
- 意义：Agent 的"眼睛"应当按 token 效率设计——结构化提取优先于像素完美渲染。

---

## 五、基础设施：打通验证门槛（海外号）

工具链要真正跑起来，还差一层基础设施：AI 服务的注册验证门槛。BeeSIM + Saily 方案以约 ¥5 开卡 + ¥7/月 成本获取真实美国手机号（收验证码、接电话），国行 iPhone/安卓/鸿蒙均可（BeeSIM 物理桥接卡内置蓝牙 + eSIM 写入模块；Saily 虚拟运营商）。要点：蓝牙/定位权限开启、从小程序连蓝牙（不从手机设置连）、可存多张 eSIM 按需切换、换机直接拔卡。

---

## 六、参考架构：把零件拼起来

    ┌─ 触发层：launchd / 任务计划程序 / /schedule（定时、事件）
    ├─ 数据层：本地数据库/日志/网页（只读抓取；Kitesurf 负责网页结构化提取）
    ├─ 治理层：本地脱敏 → 凭据进系统钥匙串 → 权限门（策略即代码）
    ├─ 执行层：Agent 内核（Pi/Claude Code）+ 原地沙箱（文件/网络/环境/凭据隔离，fail-closed）
    ├─ 能力层：Agent Skills（AI HOT 资讯）/ 工具 / 浏览器
    └─ 产出层：Markdown（机器可续）+ PDF（人可读）双格式，落到本地

落地检查清单：

1. 触发是否无人值守且可关停？（定时器 + kill switch）
2. 数据读取是否只读？（不改源数据）
3. 离机数据是否已脱敏？（本地先行）
4. Agent 执行是否被沙箱约束？（strict 级、fail-closed）
5. 凭据是否隔离？（系统钥匙串，不进配置文件/日志）
6. 输出是否双格式？（机器 + 人）
7. 第三方依赖是否有降级路径？（缓存/重试/替换端点）

---

## 七、结论

本地优先不是"退而求其次"，而是隐私、成本与控制权的最优解：数据不出本机、凭据不落文件、执行有边界、能力可插拔。把上述范式 + 沙箱 + 可扩展内核 + 外部能力 + 基础设施按"最小闭环"拼起来——先从一个每天自动完成的重复任务开始（如日报生成），验证稳定后再扩展到更多工作流。

---

## 来源备注

| 知识文件 | 主题 | 原始文件 |
|----------|------|----------|
| [[ai-automation/wechat-group-daily|微信群日报工具]] | 本地自动化范式 | raw/微信群日报工具.md |
| [[pi-agent/pi-extensions-and-sdk|Pi 扩展与 SDK]] | Agent 内核与扩展 | raw/Pi 代理 101.md |
| [[ai-security/agent-sandbox|Long Agent 原地沙箱]] | 执行安全 | （代码库）long-agent/src/long/sandbox/ |
| [[ai-tools/aihot-agent-skill|AI HOT Skill]] | Agent Skill 接入 | raw/Agent 接入.md |
| [[ai-tools/kitesurf-agent-browser|Kitesurf Agent 浏览器]] | Agent 浏览器 | raw/Introducing Kitesurf.md |
| [[overseas-access/esim-us-number|BeeSIM + Saily]] | 海外号基础设施 | raw/国行手机用上 eSIM.md |
