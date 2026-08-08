# Pi 代理框架：扩展系统与 SDK

<!--
内容元数据:
source_raw_files:
  - raw/Pi 代理 101 - 如何扩展和构建自己的线束.md
domain: pi-agent
created: 2026-07-09
updated: 2026-07-09
tags: pi, agent-framework, 扩展系统, sdk, typescript, coding-agent
related:
  - wiki/claude-code/_index.md
-->

## 摘要

Pi 是一个高度精简、可扩展的编码代理（coding agent）框架，是 OpenClaw 的最初引擎。默认只带 4 个工具：**bash、read、write、edit**——没有子代理、团队、MCP，其余一切都靠**扩展（extension）**自行添加。扩展是一个与框架挂钩的 TypeScript 文件；Pi 理解自己的扩展 API，所以你常常可以直接用自然语言让它自己写扩展并热重载。除 CLI 外，Pi 还是一组可用于构建真实 AI 应用的 SDK 包。

---

## 要点

- 默认极简：只有 bash / read / write / edit 四个工具，其他功能全部通过扩展添加。
- 几乎一切可自定义：工具、钩子、模型提供方、会话管理、命令、以及 TUI 本身。
- Pi 内置对自身扩展 API 的理解，可自然语言驱动“自己写扩展”，配合 `/reload` 热重载，代理可在运行时重写自己的框架。
- 三个核心对象暴露几乎所有挂钩点：`pi.*`（注册能力）、`pi.on(event)`（生命周期钩子）、`ctx.*`（访问实时会话）。
- 钩子可透明拦截工具输出压缩上下文——实例 `pi-hypa` 清理 bash 输出，token 削减 80%~98%，代理无感知。
- Pi 不只是 CLI，而是五个包组成的 SDK，整个代理可坍缩成一次函数调用。
- 可把同一个 session 包进 WebSocket 变成托管聊天代理；多租户后端用 `SessionManager.inMemory()`，以自有 DB 为事实源。

---

## 详细内容

### 扩展系统（Extension System）

扩展是一个与框架挂钩的 TypeScript 文件。与 Claude Code 类似都能“挂钩”，区别在于**挂钩的范围**——Pi 通过三个对象暴露几乎所有挂钩点：

- **`pi.*` 注册新能力**：`registerTool`、`registerCommand`、`registerShortcut`、`registerProvider`（接入你自己的 LLM）、`sendUserMessage`、`setActiveTools`。
- **`pi.on(event)` 响应生命周期**：input、session start、before agent start、tool call、tool result、context、before provider request、before session compaction 等。
- **`ctx.*` 访问实时会话**：`ctx.ui`、`ctx.sessionManager`、`ctx.cwd`、`ctx.model`。

`/reload` 支持热重载，因此代理可以在你使用它时重写自己的框架。示例场景：`session_start` 时调用一次 `ctx.ui.setHeader(...)` 重设 TUI 界面；在提示输入框上方显示天气；甚至在终端里跑 DOOM（`pi.dev/packages/pi-doom`）。

社区有 Pi 扩展目录，几乎能找到任何 Claude Code 或 Codex 的对应功能（如 `pi-mcp-adapter`、`pi-subagents`、`pi-plan-mode`、`pi-chrome`、`pi-computer-use` 等）。

### 构建扩展的三种典型模式

1. **注入上下文（Inject context）**——不调用任何工具就让代理感知 Git：

   ```typescript
   pi.on("before_agent_start", (event, ctx) => {
     return { systemPrompt: event.systemPrompt + "\n\n" + gitSummary() };
   });
   ```

2. **添加工具（Add a tool）**——让代理读取剪贴板：

   ```typescript
   pi.registerTool({
     name: "read_clipboard",
     description: "Read what's currently in the clipboard",
     execute: async () => ({ content: [{ type: "text", text: await clipboard.read() }] }),
   });
   ```

3. **权限门（Permission gate）**——在 prompt 到达代理之前，用一次廉价的 Haiku 调用按 `PERMISSION.md` 策略分类，allow 或 deny：

   ```typescript
   pi.on("input", async (event, ctx) => {
     const policy = await readPolicy(ctx.cwd);
     if (!policy) return { action: "continue" };
     const { decision, reason } = await classify(ctx, policy, event.text); // Haiku
     if (decision === "denied") {
       ctx.ui.notify(`Blocked by PERMISSION.md: ${reason}`, "error");
       return { action: "handled" };   // 完全跳过代理
     }
     return { action: "continue" };
   });
   ```

   例如策略设为“只有 Jason 能看营收数据”，他人问“六月营收多少？”会在到达代理前被拦截并在 UI 显示原因。

### 上下文压缩钩子实例：pi-hypa

`pi-hypa` 用钩子直接清理 bash 命令输出。比如 `git log --stat -200` 会剥掉 diff、subject、comments 等冗余，只保留 commit，通常削减 80%~98% 数据量。它透明地拦截 Pi 常规 bash 工具，代理既不会请求压缩，也看不到那约 34k 个无用 token。

### 用 Pi SDK 构建真实 AI 应用

多数人忽略了 Pi 不只是 CLI，而是**五个包**：

- **pi-ai**：调用任意模型（支持 Claude、Codex 订阅 OAuth）。
- **pi-agent**：核心循环。
- **pi-coding-agent**：相当于 Claude Code SDK，含工具、会话、压缩、扩展。
- **TUI**。
- **orchestrator**（编排器）。

整个代理可坍缩为一次函数调用。约 15 行、无 UI 的代理：

```typescript
import { createAgentSession, SessionManager } from "@earendil-works/pi-coding-agent";

const { session } = await createAgentSession({
  sessionManager: SessionManager.inMemory(),
});

session.subscribe((event) => {
  if (event.type === "message_update" && event.assistantMessageEvent.type === "text_delta") {
    process.stdout.write(event.assistantMessageEvent.delta);   // 流式输出到你的 UI
  }
});

await session.prompt("Look at the files here and tell me what this project is.");
```

`npx tsx` 运行即用现有 Pi 认证（你的 Claude 订阅，文件里无需 API key）流式输出。把同一个 session 包进 WebSocket，就得到一个托管聊天代理——每个浏览器标签页一个 session。

做产品时用资源加载器（resource loader）为每个 session 划定范围，并注入自有工具：

```typescript
const resourceLoader = new DefaultResourceLoader({
  cwd,                                  // 代理工作的目录（每用户沙箱）
  agentDir: getAgentDir(),              // 配置/认证根，留在宿主机
  noExtensions: true, noSkills: true,   // 拒绝环境自动拾取，只允许显式传入
  extensionFactories: [guardrail],      // 策略即代码（如拦截危险 bash）
});
await resourceLoader.reload();

const { session } = await createAgentSession({
  sessionManager: SessionManager.inMemory(),
  customTools: [getMrr],                // 你产品自己的能力
  resourceLoader,
});
```

作者用这个形态构建了 Posia（自主启动并运营业务的代理）。从本地转向 web 托管只需一处调整：Pi 默认假设本地文件系统（会话为 JSONL、工具在宿主运行）。多租户后端跑 `SessionManager.inMemory()`，把自有 DB 作为事实源（镜像 `session.subscribe`），并把 bash / read / write 重新接到每个用户的沙箱。

---

## 来源备注

| 原始文件 | 位置 | 备注 |
|----------|------|------|
| [[raw/Pi 代理 101 - 如何扩展和构建自己的线束\|Pi 代理 101]] | raw/ | 作者 [@jasonzhou1993](https://x.com/jasonzhou1993)，中英混排剪藏，来源 x.com；含视频（17:23）与多张截图 |
