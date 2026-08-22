# Codex 作为平台：开放 Agent 线束

<!--
source_raw_files:
  - raw/Codex as a platform build on the open agent harness.md
domain: agent-platform
created: 2026-08-21
updated: 2026-08-21
tags: codex, agent-harness, app-server, sdk, mcp, 嵌入式agent, sandbox, approval
related:
  - wiki/pi-agent/compaction.md
  - wiki/agent-fleet/enterprise-agent-fleet.md
-->

## 摘要

OpenAI 将 Codex 的核心——开源 agent harness——定位为平台。应用拥有界面、业务上下文和审批流，Codex harness 提供 agent 循环（上下文管理、工具调用、流式执行、沙箱）。三种集成层（codex exec / SDK / app-server）覆盖从一次性脚本到持久会话的全部场景。

---

## 要点

- Agent harness 是可复用的执行系统：管理会话状态、流式执行、工具调用、沙箱策略、审批请求。
- 核心主张：把 agent 嵌入已有产品界面（dashboard/工单/IDE），而非要求用户搬到通用聊天框。
- 应用三个所有权层：界面（用户看到什么）、上下文与工具（MCP 暴露给 agent 的数据和动作）、操作边界（沙箱/审批/可观测性）。
- 在 ARC-AGI-3 上，harness 设计（retained reasoning + context compaction）让 GPT-5.6 Sol 从 13.3% → 38.3%，同时 output tokens 降 6 倍。
- 三种集成层选择：
  - `codex exec`：非交互一次性任务，返回结构化输出。
  - Codex SDK：程序化 agent 工作流。
  - Codex app-server：持久会话、流式事件、审批处理——适合 agent 是产品一部分的场景。

---

## 详细内容

### 架构分层

```
┌─────────────────────────────────────────┐
│ 应用层（你的产品）                        │
│  - 界面（dashboard/工单/IDE）            │
│  - 业务上下文 & MCP 工具                  │
│  - 审批 & 权限                           │
├─────────────────────────────────────────┤
│ Codex app-server                         │
│  - Agent 循环 & 会话状态                  │
│  - 沙箱执行                              │
│  - 工具调用 & 流式事件                    │
├─────────────────────────────────────────┤
│ 模型层（GPT-5.x）                        │
└─────────────────────────────────────────┘
```

### 集成层选择

| 层 | 场景 | 特点 |
|----|------|------|
| `codex exec` | CI、脚本、后台一次性任务 | 有界执行，返回结构化输出 |
| Codex SDK | 程序化工作流 | 直接编程接口 |
| app-server | 产品内嵌 agent | 持久会话、流式、审批、MCP |

### 实际案例

- GitHub/JetBrains：IDE 内嵌 Codex 作为 agent provider。
- Cisco：App Builder 使用 Codex SDK 构建部署流程。
- Thrive Holdings：税务准备工作流，7000 份申报处理时间减少 1/3。
- Relay（OpenAI 示例应用）：虚拟货运 dashboard，agent 通过 MCP 工具查询数据、提建议、需审批后才执行变更。

### 关键洞察

harness 设计对结果有实质影响——不只是 prompt engineering，执行系统本身（上下文保留、compaction、工具编排）能数倍改变任务成功率。

---

## 来源备注

| 原始文件 | 位置 | 备注 |
|----------|------|------|
| [[raw/Codex as a platform build on the open agent harness\|Codex as a platform]] | raw/ | OpenAI 开发者博客 2026-08 |
