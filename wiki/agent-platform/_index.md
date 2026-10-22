# Agent 平台 / Agent Platform

最后更新: 2026-10-22

---
<!--
领域元数据:
domain: agent-platform
created: 2026-08-21
updated: 2026-10-22
tags: agent-platform, agent-harness, codex, sdk, app-server, mcp, 嵌入式agent, deepseek, dsh, plugin-architecture, cordis
summary: Agent 运行时/线束（harness）作为平台的架构模式：将 agent 循环嵌入产品，或把线束自身完全插件化交由用户改造。
-->

## 概览

当 Agent 从独立应用走向平台化，核心问题变为：如何把 agent 循环嵌入已有产品（dashboard/工单系统/IDE），而非让所有人搬到通用聊天框。本领域关注 agent harness 的架构（会话状态、工具暴露、沙箱、审批流）与集成模式，以及把 harness 核心（含 agent loop）全部插件化、由配置与 Profile 驱动的另一种平台路线（DeepSeek Harness）。

---

## 内容

| 文件 | 标题 | 标签 | 更新日期 | 摘要 |
|------|------|------|----------|------|
| [[codex-as-platform\|Codex 作为平台：开放 Agent 线束]] | Codex as a platform | codex, harness, app-server, sdk, mcp, 嵌入式agent | 2026-08-21 | OpenAI Codex 开源 harness 架构：应用拥有界面/上下文/审批，Codex 提供 agent 循环与沙箱执行；三种集成层（exec/SDK/app-server）适配不同场景。 |
| [[what-is-a-harness\|什么是 Agent Harness]] | What is a Harness? | agent-harness, system-prompt, tools, agentic-loop, translation-layer, open-source, 用户主权 | 2026-08-22 | Agent harness 概念基础：四要素（系统提示词/工具/agentic loop/翻译层）、开源中立与用户主权。 |
| [[deepseek-harness\|DeepSeek Harness：一切皆插件的开源 Agent 线束]] | DeepSeek Harness | deepseek, dsh, agent-harness, plugin-architecture, cordis, profile, trajectory, 插件市场, 权限 | 2026-10-22 | DSH 把模型适配器、工具、会话存储、界面与 agent loop 全部做成可热插拔插件，配置收敛到 cordis.patch.yml；轨迹、四档权限、四种模式与开放插件市场构成完整工作台，代价是预览版与安全风险。 |

---

## 来源文件

| 原始文件 | SHA-256 | 对应知识文件 | 处理日期 | 备注 |
|----------|---------|-------------|----------|------|
| [[raw/Codex as a platform build on the open agent harness\|Codex as a platform]] | 5733a9fdf6f8 | [[codex-as-platform]] | 2026-08-21 | OpenAI 开发者博客 |
| [[raw/What is a Harness?\|What is a Harness?]] | c6644bbb81bc | [[what-is-a-harness]] | 2026-08-22 | Earendil Product 博客 |
| [[raw/万字长文｜DeepSeek Harness 从 0 到 1：一切皆插件的 Agent，到底强在哪、怎么上手\|万字长文｜DeepSeek Harness 从 0 到 1]] | 9adbd91bca72 | [[deepseek-harness]] | 2026-10-22 | 小墨同学（@xiaomovps）上手长文 |

---

## 相关领域

| 领域 | 关系 | 相关度 |
|------|------|--------|
| [[pi-agent/_index\|Pi 代理框架]] | 同为 agent 运行时架构，Pi 侧重扩展系统，Codex 侧重平台嵌入；Harness 概念四要素即 Pi 的底层框架 | 高 |
| [[agent-cost-optimization/_index\|Agent 成本优化]] | harness 工作流的 token 消耗结构（system prompt/tools/loop）正是成本优化的对象 | 中 |
| [[agent-fleet/_index\|Agent 舰队]] | 舰队治理依赖底层 harness 平台提供的审批/沙箱/工具接口 | 中 |
| [[graph-engineering/_index\|Graph Engineering]] | 图结构编排可跑在 harness 之上 | 中 |
| [[ai-security/_index\|AI 安全]] | 插件以用户权限运行、间接提示词注入实测命中，是开放型 harness 的主要风险面 | 中 |
