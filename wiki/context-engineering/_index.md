# 上下文工程 (Context Engineering)

最后更新: 2026-09-23

---
<!--
领域元数据:
domain: context-engineering
created: 2026-09-23
updated: 2026-09-23
tags: context-engineering, llm, agents, attention-budget, compaction, memory, context-editing
summary: 管理 LLM 上下文窗口的策略与工具：注意力预算、上下文检索、压缩、结构化笔记与人在回路的上下文管理。

链接格式规则（Obsidian 可点击）:
- 内容表中"文件"列使用 [[topic-file|显示标题]] 格式
- 来源文件表中"原始文件"列使用 [[raw/path/file|显示名]] 格式
- 来源文件表中"对应知识文件"列使用 [[topic-file]] 格式
- 相关领域表中"领域"列使用 [[other-domain/_index|领域标题]] 格式
- 禁止使用反引号包裹路径（Obsidian 不会渲染为可点击链接）
-->

## 概览

上下文工程是提示词工程的自然延伸：不再只关注"怎么写好一段提示词"，而是关注"每一次推理时放进上下文窗口的这组 token 是否最优"。核心原则是把上下文视为收益递减的有限资源（注意力预算），用最小的高信号 token 集合最大化期望行为的概率。本领域覆盖三类材料：Anthropic 的方法论总纲、Claude API 的上下文编辑工具，以及提出人在回路（human-in-the-loop）上下文管理的框架设想。

---

## 内容

| 文件 | 标题 | 标签 | 更新日期 | 摘要 |
|------|------|------|----------|------|
| [[effective-context-engineering\|有效上下文工程方法论]] | 有效上下文工程方法论 | context-engineering, agents, attention-budget, compaction, sub-agents | 2026-09-23 | Anthropic 的上下文工程总纲：注意力预算、恰到好处的上下文构成、just-in-time 检索，以及长任务的压缩、笔记与子代理三招。 |
| [[context-editing\|上下文编辑 API 实践]] | 上下文编辑 API 实践 | context-editing, tool-results, thinking-blocks, prompt-caching, api | 2026-09-23 | Claude API 的服务端工具结果清除、思考块清除与客户端 SDK 压缩，及其与提示缓存、记忆工具的配合。 |
| [[human-in-loop-context-curation\|人在回路的上下文管理框架]] | 人在回路的上下文管理框架 | human-in-the-loop, two-chat, meta-chat, abstraction | 2026-09-23 | 双聊天架构与元工作台设计，用基础的增删钉摘要重排工具收集人工管理习惯，逐步演化为层级抽象能力。 |

---

## 来源文件

| 原始文件 | SHA-256 | 对应知识文件 | 处理日期 | 备注 |
|----------|---------|-------------|----------|------|
| [[raw/Effective context engineering for AI agents.md\|Effective context engineering for AI agents]] | 084ad93558de | [[effective-context-engineering]] | 2026-09-23 | Anthropic 工程博客，领域方法论总纲 |
| [[raw/上下文编辑.md\|上下文编辑]] | 9a372e1235c9 | [[context-editing]] | 2026-09-23 | Claude 开发者平台文档，API 工具层 |
| [[raw/Learning Dynamic Context Management in LLMs through Human-in-the-Loop Curation A Proposed Framework From Basic Tools to Hierarchical Abstraction.md\|Learning Dynamic Context Management in LLMs through Human-in-the-Loop Curation]] | bf5f11064154 | [[human-in-loop-context-curation]] | 2026-09-23 | Medium 论文式提案，人机交互视角 |

---

## 相关领域

| 领域 | 关系 | 相关度 |
|------|------|--------|
| [[ai-assisted-workflow/_index\|AI 辅助工作流]] | 上下文工程策略直接决定 Agent 工作台与 Skill 的实际效果 | 高 |
| [[machine-native-intelligence/_index\|机器原生智能]] | 同属面向 LLM/Agent 的能力构建方向 | 中 |
