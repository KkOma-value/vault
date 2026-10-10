# AI 辅助工作流

最后更新: 2026-09-29

---
<!--
领域元数据:
domain: ai-assisted-workflow
created: 2026-09-22
updated: 2026-09-29
tags: ai-workflow, codex, lark-cli, skill, multi-agent, knowledge-base, design-loop, critic-loop
summary: 用 Codex、飞书 CLI 与项目级 Skill 搭建 Agent 个人工作台与云端知识库，以及发散-批评-收敛的多 Agent 设计工作流。

链接格式规则（Obsidian 可点击）:
- 内容表中"文件"列使用 [[topic-file|显示标题]] 格式
- 来源文件表中"原始文件"列使用 [[raw/path/file|显示名]] 格式
- 来源文件表中"对应知识文件"列使用 [[topic-file]] 格式
- 相关领域表中"领域"列使用 [[other-domain/_index|领域标题]] 格式
- 禁止使用反引号包裹路径（Obsidian 不会渲染为可点击链接）
-->

## 概览

本领域整理如何用 AI 编程 Agent（Codex）搭配飞书 CLI 与项目级 Skill 搭建个人工作台。核心思路是用"意图路由"让 Agent 直接操作飞书多维表格，用现成组件的成熟度替代手写前端，并把本地工作台演进为跨 Agent、跨设备共享的云端知识库。此外收录把 AI 组织成设计团队的多 Agent 设计工作流：用外部随机性扩大搜索空间，用独立 Design Critic 建立审美反馈闭环，以删减完成最终打磨。

---

## 内容

| 文件 | 标题 | 标签 | 更新日期 | 摘要 |
|------|------|------|----------|------|
| [[codex-lark-workbench\|用 Codex + 飞书 CLI 搭建创作工作台]] | 用 Codex + 飞书 CLI 搭建创作工作台 | ai-workflow, codex, lark-cli, skill, multi-agent | 2026-09-22 | 用飞书多维表格替代自建前端，用项目级 Skill 做意图路由，并把工作台升级为 Agent 云端知识库。 |
| [[ai-design-loop\|AI 设计循环：发散 → Critic 反馈 → 收敛打磨]] | AI 设计循环：发散 → Critic 反馈 → 收敛打磨 | ai-workflow, multi-agent, critic-loop, taste, ui-design | 2026-09-29 | 把 AI 设计从一次生成改造成多 Agent 工作流：外部随机性扩大搜索空间、独立 Design Critic 审美闭环、删减收尾。 |
| [[seed-string-agent-architecture\|Seed String 策略：Discover 阶段的 Agent 架构设计笔记]] | Seed String 策略：Discover 阶段的 Agent 架构设计笔记 | seed-string, discover, agent-architecture, external-randomness, prompt-engineering | 2026-10-01 | 把 Discover 阶段 Seed String 策略翻译成工程方案：随机源、解码映射规则、Explorer 并行架构、Ordo 与 Qoder 落地场景。 |

---

## 来源文件

| 原始文件 | SHA-256 | 对应知识文件 | 处理日期 | 备注 |
|----------|---------|-------------|----------|------|
| [[raw/放弃手写界面后，我用 Codex 搭配飞书 CLI 搭建了创作工作台.md\|放弃手写界面后，我用 Codex 搭配飞书 CLI 搭建了创作工作台]] | b78c035f92e1 | [[codex-lark-workbench]] | 2026-09-22 | Codex + 飞书 CLI 个人工作台实践 |
| [[raw/解析方法论.md\|解析方法论]] | 66d078f3516e | [[ai-design-loop]] | 2026-09-29 | Lenny's Newsletter「把 AI 变成世界级设计师」方法论解析 |

---

## 相关领域

| 领域 | 关系 | 相关度 |
|------|------|--------|
| [[self-media-growth/_index\|自媒体成长]] | 该工作台用于管理自媒体选题与创作流程 | 高 |
| [[indie-product-growth/_index\|独立产品增长]] | 同类 AI 工作流也可服务于独立产品开发 | 中 |
| [[ai-video-creation/_index\|AI 视频创作]] | AI 视频 Skill 的安装与 Agent 调用属于同类工作流实践 | 中 |
| [[context-engineering/_index\|上下文工程]] | 上下文管理策略直接影响 Agent 工作台的效果 | 中 |
| [[ui-ux-design/_index\|UI/UX 设计]] | 设计循环中的 Critic 反馈以 UI/UX 设计知识为基础 | 中 |
