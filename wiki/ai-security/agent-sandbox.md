# Long Agent 的原地沙箱：把 AI 代理的执行约束在可控边界内

<!--
内容元数据:
source_raw_files:
  - (代码库) long-agent/src/long/sandbox/ —— 非 raw 剪藏，基于源码梳理与实测验证
domain: ai-security
created: 2026-08-09
updated: 2026-08-09
tags: ai-security, agent-sandbox, sandbox, seatbelt, srt, 进程隔离, 执行安全, 失败关闭, npm隔离, guest环境
related:
  - wiki/ai-security/_index.md
  - wiki/ai-security/openai-hf-agent-incident.md
  - wiki/ai-automation/_index.md
-->

## 摘要

Long Agent（long-agent）对"把 AI 代理放进真实工作区、让它直接执行命令"这件事，采用的默认防护是**原地 OS 进程沙箱（in-place process sandbox）**。它既不建容器、也不建 git worktree，而是让代理进程直接在宿主机上运行，再用 **macOS Seatbelt（经 Anthropic SRT CLI）＋ 资源限制 ＋ 应用层路径策略**三重约束住它能碰到的东西。核心语义是"**可信程序 + 隔离数据**"：npm、git、python 等程序从宿主借用，但全局状态、缓存、配置、凭据全部隔离到会话私有目录。文章覆盖它的威胁模型、三级配置、Seatbelt 的 deny-then-reallow 文件策略、回环网络代理、合成 HOME 环境、每个 turn 启动前的策略探测（fail-closed），以及实测验证的 npm 隔离边界与固有取舍——npm 包的 postinstall 脚本仍以宿主用户身份执行，这是原地沙箱的边界所在。

---

## 要点

- **原地沙箱 ≠ 隔离环境**：进程跑在宿主上、以你的用户身份运行，沙箱约束的是"它能碰到什么"（文件写、敏感读、网络、环境变量），而不是把它搬进容器或 worktree。文档明确：沙箱从不创建或选择 git worktree。
- **三级配置**：`disabled`（不包装）/ `permissive`（仅 ulimit 资源护栏，不做文件隔离）/ `strict`（默认，SRT→Seatbelt）。strict 下后端不可用就 **fail-closed 拒绝启动**，绝不静默降级成裸奔。
- **文件策略是 deny-then-reallow**：先 deny `/` 与敏感根（`~/.ssh`、`.gnupg`、`.aws`、`.config/gcloud`、`.long`、`Library/Keychains`），再只 re-allow 系统根 + 工作区 + 会话目录 + 少量托管运行时；写只给工作区 + 会话目录 + `/dev/null`，`.git`、`.env`、宿主 shell rc 全部 deny-write。
- **网络走可信回环代理**（HTTP CONNECT + SOCKS5）：域名白/黑名单 + 私有网段硬 deny（`127/8`、`10/8`、`172.16/12`、`192.168/16`、`fc00::/7` 等），防 SSRF 打到本机与内网；DNS 解析结果也会再校验一次 IP。
- **Guest 环境用合成 HOME**：最小 PATH（只含系统目录）、凭据 env 全拉黑（API Key、GITHUB_TOKEN、DATABASE_URL 等）、`PYTHONNOUSERSITE=1`、XDG/NPM 缓存全部重定向到会话私有目录。
- **每个 turn 启动前跑策略探测**：工作区内写必须成功、工作区外写与敏感读必须失败，任何一步探测不过就拒绝该 turn，不给执行权。
- **应用层 FileAccessPolicy 拦"受信任文件工具"本身**：执行前 check_read/check_write，拒绝 NUL 字节、硬链（`st_nlink>1`，双次 stat 比对 inode）、`.git` 写入、敏感读取。
- **npm 实测边界**：guest 用的是宿主 `/opt/homebrew/bin/npm`（程序），但 `cache` / `prefix -g` / `root -g` / `.npmrc` 全部重定向到会话目录，宿主 `~/.npmrc` 与全局 node_modules 的读/写均被 Seatbelt 拒绝。
- **固有取舍**：npm 包、编译产物里的 postinstall 脚本仍以宿主用户身份执行（进程在宿主上跑），只被文件/网络/环境三重边界约束；`container_isolated` 后端目前是 `available()=False` 的占位。

> 与 [[ai-security/openai-hf-agent-incident|自主 Agent 集群的群体智慧攻击]] 构成攻防对偶：那篇讲"进攻侧——AI 无人类指挥完成入侵"，本篇讲"防守侧——把 AI 代理的执行约束在可控边界内"。本领域的防守范式也与 [[ai-automation/_index|AI 自动化]] 的"本地优先、凭据隔离"一脉相承。

---

## 详细内容

### 它解决什么问题：把"破坏半径"从整台电脑收窄到工作区

Long 是本地优先、直接在真实工作区干活的 AI 代理平台。模型幻觉写错命令、被提示词注入、或想读不该读的东西，后果真实落在你的 Mac 上。威胁模型不是"对抗内核级逃逸"，而是这些**非恶意但真实发生**的误操作：偷读凭据（`cat ~/.ssh/id_rsa`）、内网探测（`curl http://169.254.169.254/...` 云元数据）、破坏 git/环境（误改 `.git/config`、覆盖 `.zshrc`）、泄漏密钥（工具输出里打 `echo $API_KEY`）。沙箱让"把 agent 放进真实目录跑代码"从裸奔变成"有边界的裸奔"——把 90% 的幻觉/注入后果挡在工作区之内。

### 三级配置与 Backend 抽象

- `SandboxLevel.disabled` → `DisabledBackend`：不包装，只 `source ~/.zshrc` 后原样跑命令。
- `SandboxLevel.permissive` → `ProcessIsolationBackend`：只有 ulimit 资源护栏（`ulimit -v 2097152 -f 1048576`，虚拟内存 2GB、单文件 1MB）。刻意**不加 `-u`（NPROC）**：macOS 的进程数是按用户全局计数的，加了会让外部命令在 `fork()` 全挂。
- `SandboxLevel.strict`（默认）→ `SrtNativeBackend`：固定版本 `@anthropic-ai/sandbox-runtime@0.0.67`（SRT CLI）。macOS 上它调 Seatbelt，Linux 上调 Bubblewrap。关键安全点：
  - **可信探测**：启动前把 launcher 解析成绝对路径，校验不是 group/world-writable（防 PATH 注入替换二进制），并校验版本一致；带 30s TTL + 指数退避缓存探测结果。guest 永远**不能**通过自己的 PATH 解析 launcher。
  - **私有 per-session 配置**：每个 turn 把文件/网络规则写成 JSON 到会话私有 settings 文件，不碰全局 SRT 配置。
  - **不在 guest 里 source 宿主 rc 文件**（`_sandbox_shell_prefix` 返回空串）。

`create_backend()` 按 level 选后端；strict 下若 SRT 不可用或探测失败，抛出 `SandboxUnavailableError`，上层按"后端缺失"处理而不是放行。

### 文件系统：Seatbelt 的 deny-then-reallow

macOS Seatbelt 的 `allowRead` 是 **allow-within-deny** 语义，必须成对出现：

1. **deny 根**：`/` ＋ 敏感目录（`~/.ssh`、`.gnupg`、`.aws`、`.config/gcloud`、`.long`、`.long-agent`、`Library/Keychains`）。
2. **re-allow 读**：系统根（`/bin`、`/usr`、`/System`、`/Library` 等）＋ 工作区 ＋ 会话 home/tmp ＋ npm prefix ＋ `~/.long/system-skills|profiles|venv`、`~/.long-agent/runtime` 这类被托管、合法 skill 可能要执行的代码。
3. **写只给**：工作区 ＋ 会话 home/tmp ＋ npm prefix ＋ `/dev/null`。
4. **额外 deny-write**：工作区里的 `.git/.gitmodules/.env` ＋ 宿主 shell rc 文件（`.zshrc`、`.bash_profile` 等）——防 agent 改 git 元数据或宿主 shell 配置。
5. SBPL 编译时对**嵌套在 allow 里的 deny** 会重发一次，避免后发的宽 allow 覆盖窄 deny。

### 网络：可信回环代理

strict 模式下 guest 的网络只能连到本机一个随机端口的代理（`NetworkProxy`），由它代为访问外网：

- 实现 **HTTP CONNECT + SOCKS5** 双协议，按 `allowed_domains` / `denied_domains` 匹配。
- **硬 deny 私有网段**：`127/8`、`10/8`、`172.16/12`、`192.168/16`、`fc00::/7`、`fe80::/10` 等——防 SSRF 打本机/内网/链路本地。
- DNS 解析出的 IP 会再校验一次是否落在私有段；`session` 级别的授权会记录复用。
- guest 默认**不能 bind 监听端口**（除非 `allow_local_binding`）。

### Guest 环境：合成 HOME 与凭据隔离

`build_guest_env()` 不继承宿主环境，只显式放行稳定值：

- **HOME 换成合成的会话 home**；PATH 只含系统根（`/usr/local/bin`、`/opt/homebrew/bin`、`/usr/bin`、`/bin`…），不继承宿主 PATH 探测结果（要加工具链路径得显式配 `env_extra_path`）。
- **凭据 env 全拉黑**：`ANTHROPIC_API_KEY`、`OPENAI_API_KEY`、`AWS_SECRET_ACCESS_KEY`、`GITHUB_TOKEN`、`DATABASE_URL`、`LONG_API_KEY`、`SECRET_KEY` 等。
- `PYTHONNOUSERSITE=1`（读不到用户 site-packages）、`XDG_*` 与 `NPM_CONFIG_CACHE` 重定向到会话目录、`TMPDIR` 指向会话 tmp。

### 应用层：FileAccessPolicy 拦受信任文件工具

Seatbelt 拦的是 shell 命令；对 read_file/write 这类**受信任文件工具本身**，在执行前走 `check_read` / `check_write`：

- **硬链 inode 拒绝**：读两次 stat 比对 `(st_dev, st_ino)`，`st_nlink > 1` 即拒绝——防工作区内的硬链别名指向工作区外的字节。
- workspace 内 `.git` 路径 write 一律拒绝；NUL 字节直接 PermissionError。
- 敏感根、deny 规则、工作区/系统白名单的顺序判定，支持 `read_scope="host"` 放宽读。

### 生命周期：每 turn 的 fail-closed 探测

每次会话 turn 开始（`AgentLoop` 里）调用 `SandboxManager.create_context()`：

1. 生成会话私有目录 `~/Library/Caches/LongAgent/s/<sha256(session_id)[:16]>`——路径**刻意保持短**，因为 macOS 对 sockaddr_un 长度限制很严，SRT 的 mux socket 路径过长会被误判成"后端不可用"。
2. `backend.prepare()` 写 SRT settings JSON。
3. **跑一次策略探测**：工作区内写/改/删必须成功，工作区外写、读 `~/.long`、读 `.git`、读 `.zshrc` 必须失败——任何一步不过就 `SandboxUnavailableError`，fail-closed 拒绝启动。
4. 组装 `SandboxContext` 经 `contextvars` 注入当前 turn；违规经 `record_violation()` 安全调度回 AgentLoop 事件循环，触发 SSE 事件 `sandbox_violation` / `sandbox_status`。

执行层 `ExecutionSupervisor` 统一用 `start_new_session=True`（独立进程组），超时/取消按进程组 SIGTERM→SIGKILL，输出上限 50KB；有沙箱上下文时用 `backend.wrap()` 包命令、换 `guest_env`，后端不可用则返回 `sandbox_unavailable` 结果而不是裸跑。

### npm 实测：用宿主程序，隔离宿主状态

在 long-agent 的 `.venv` 里走完整链路（create_context → backend.wrap → guest_env → 真实执行）实测：

| 项 | 宿主交互 shell | Sandbox guest | 隔离 |
|----|---------------|---------------|------|
| `which npm` | `~/.local/bin/npm` | `/opt/homebrew/bin/npm` | 程序从宿主借，但走系统路径 |
| `npm config get cache` | `/Users/hb41142/.npm` | `…/s/<session>/home/.npm` | 缓存重定向 |
| `npm prefix -g` | `/Users/hb41142/.local` | `…/s/<session>/npm` | 全局安装目标重定向 |
| `npm root -g` | `~/.local/lib/node_modules` | `…/s/<session>/npm/lib/node_modules` | 全局包落不到宿主 |
| `cat ~/.npmrc` | 存在（含配置） | **DENIED** | 合成 HOME + Seatbelt |

边界真实验证：guest 里直接读宿主 `~/.npmrc` → DENIED；写宿主全局 node_modules → DENIED；`npm install -g`（dry-run）目标落在会话目录。**结论：guest 继承宿主的 npm 程序（可信代码），但 npm 的状态——缓存、全局目录、`.npmrc`、token——全部与宿主隔离。**

### 固有边界与后续

- **postinstall 脚本在宿主上跑**：npm install 会执行包的 `postinstall` 脚本，它无法写工作区之外、无法继承凭据/配置、网络受代理管控，但它确实消耗你的 CPU。要连这层一起隔离，需要真正的 container 后端——代码里的 `ContainerBackend` 目前是 `available()=False` 的占位。
- **历史遗留**：`transaction.py`（git worktree + 不可变 manifest + 冲突检测发布系统）与 `worktree.py` 是旧 schema v10 的方案，agent loop 不再调用，仅留作一个 release 的恢复面，走 `/v1/legacy/workspace-transactions` 只读接口。

---

## 来源备注

| 原始文件                              | 位置       | 备注                                                                                                                                                                                                          |
| --------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| （代码库）long-agent/src/long/sandbox/ | 无 raw 剪藏 | 基于 long-agent 沙箱包源码（backend/config/env/manager/policy/proxy/sbpl/transaction）梳理，并实测验证 npm guest-vs-host 隔离边界（`npm config get cache/prefix`、读宿主 `~/.npmrc`、写全局 node_modules 均 DENIED）。非 raw 文件，故不登记 SHA-256。 |
