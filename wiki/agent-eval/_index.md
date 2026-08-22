# Agent 评测 / Agent Eval

最后更新: 2026-08-21

---
<!--
领域元数据:
domain: agent-eval
created: 2026-08-21
updated: 2026-08-21
tags: agent-eval, eval-driven-development, agent-skills, 评测, 自动化测试, firebase, llm-as-judge
summary: 用评测（eval）驱动 Agent 技能开发的方法论：先写测试再写 skill，量化 agent 成功率并迭代优化。
-->

## 概览

Agent 技能/插件越来越多，但"写了 skill 就能用"是幻觉。Eval-driven development 用自动化评测量化 agent 在特定任务上的成功率，先建基线再迭代 skill，把 agent 质量从"希望能用"变为"可证明能用"。本领域收录 eval 方法论、评测类型设计、以及 eval 反过来改进底层工具的实践。

---

## 内容

| 文件 | 标题 | 标签 | 更新日期 | 摘要 |
|------|------|------|----------|------|
| [[eval-driven-development\|Eval 驱动开发]] | Eval-driven development | eval, agent-skills, firebase, llm-as-judge, 基线, hill-climb | 2026-08-21 | Firebase 团队用 eval 驱动 skill 开发：三类 eval（单 skill/激活/E2E），先测后写的迭代循环，skill 使通过率从 31.7% → 78%、input tokens 降 40%。 |

---

## 来源文件

| 原始文件 | SHA-256 | 对应知识文件 | 处理日期 | 备注 |
|----------|---------|-------------|----------|------|
| [[raw/Eval-driven development\|Eval-driven development]] | dd387ba2b3ff | [[eval-driven-development]] | 2026-08-21 | Firebase Blog, Charlotte Liang |

---

## 相关领域

| 领域 | 关系 | 相关度 |
|------|------|--------|
| [[claude-code/_index\|Claude Code]] | Claude Code 的 skill 同样需要 eval 验证激活与效果 | 高 |
| [[agent-platform/_index\|Agent 平台]] | eval 量化 harness + skill 的联合效果 | 中 |
| [[code-migration/_index\|代码迁移]] | 大规模迁移中的 judge 判据本质也是 eval | 中 |
