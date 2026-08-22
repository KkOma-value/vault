# Agent 舰队 / Agent Fleet

最后更新: 2026-08-18

---
<!--
领域元数据:
domain: agent-fleet
created: 2026-08-18
updated: 2026-08-18
tags: agent-fleet, managed-agents, 企业部署, agent-as-code, 反馈循环, harvester-tuner, 成本追踪, fleet-governance
summary: 企业级 AI Agent 舰队的部署、治理与持续优化：agent-as-code、非开发者构建、反馈循环（harvester-tuner）、成本效率比追踪、从人工审核到自动化的信任阶梯。
-->

## 概览

企业如何从零散的 AI 实验走向可治理的 Agent 舰队：统一基础设施（版本化、可观测、常驻云端）、让非开发者也能构建生产 agent、通过 harvester-tuner 反馈循环持续优化 prompt/config、以价值/成本效率比驱动扩张决策。核心理念：agent 是结构化文本，一切皆代码，PR 是控制面。

---

## 内容

| 文件 | 标题 | 标签 | 更新日期 | 摘要 |
|------|------|------|----------|------|
| [[abc-legal-managed-agents\|ABC Legal 案例：全员构建 Agent]] | ABC Legal + Claude Managed Agents | managed-agents, agent-as-code, harvester-tuner, 企业案例 | 2026-08-18 | 1100 人公司部署 50+ 生产 agent，非开发者一周上手，harvester-tuner 三角色自改进，成本 J 曲线 |

---

## 来源文件

| 原始文件 | SHA-256 | 对应知识文件 | 处理日期 | 备注 |
|----------|---------|-------------|----------|------|
| [[raw/How ABC Legal turned every employee into a builder with Claude Managed Agents\|ABC Legal Managed Agents]] | ebd62187a38e | [[abc-legal-managed-agents]] | 2026-08-18 | Anthropic blog case study |

---

## 相关领域

| 领域 | 关系 | 相关度 |
|------|------|--------|
| [[ai-automation/_index\|AI 自动化]] | 自动化是单个 agent 维度，本领域关注舰队级治理 | 高 |
| [[claude-code/_index\|Claude Code]] | Managed Agents 与 Claude Code 同属 Anthropic 生态 | 中 |
| [[multiagent-coordination/_index\|多 Agent 协作]] | 舰队中 agent 间协调的理论基础 | 中 |
