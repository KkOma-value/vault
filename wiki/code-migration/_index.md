# 代码迁移 / Code Migration

最后更新: 2026-07-24

---
<!--
领域元数据:
domain: code-migration
created: 2026-07-24
updated: 2026-07-24
tags: code-migration, claude-code, 多agent, 对抗式审查, judge, loop, dynamic-workflows
summary: 用 Claude Code + 多 agent 循环做大规模代码迁移的方法论：先建可信 judge，再跑"实现—审查—修复"循环，让对抗式审查负责判断、机械化脚本负责验证，核心是修流程而非修代码。
-->

## 概览

大规模代码迁移（把生产代码库移植到新语言）在 LLM 时代从多年工程压缩到数周。核心方法论：**不修代码，修产出代码的流程**。围绕一个先验证过的 judge（测试判据）展开六步流程——建规则手册与缺口清单、压测规则、全量翻译、编译、运行、行为对齐——每一步都用"实现—审查—修复"多 agent 循环，审查对抗化、验证机械化，大模型做审查者、小模型做实现 fan-out。

---

## 内容

| 文件 | 标题 | 标签 | 更新日期 | 摘要 |
|------|------|------|----------|------|
| [[large-scale-migration\|大规模代码迁移]] | 用 Claude Code 做大规模代码迁移 | code-migration, 多agent, 对抗式审查, judge, loop | 2026-07-24 | 修流程不修代码；先建可验证 judge；六步流程；模型分层；build daemon 串行化最贵操作；缺测试套件就让 Claude 造裁判。 |

---

## 来源文件

| 原始文件 | SHA-256 | 对应知识文件 | 处理日期 | 备注 |
|----------|---------|-------------|----------|------|
| [[raw/How Anthropic runs large-scale code migrations with Claude Code\|How Anthropic runs large-scale code migrations]] | 4fed7debbb12 | [[large-scale-migration]] | 2026-07-24 | @ClaudeDevs，Bun 与 Anthropic Labs 案例 |

---

## 相关领域

| 领域 | 关系 | 相关度 |
|------|------|--------|
| [[graph-engineering/_index\|Graph Engineering]] | 迁移用的"实现—审查—修复"多 agent 循环、并行 fan-out、验证关卡就是 Graph Engineering 的落地形态 | 高 |
| [[claude-code/_index\|Claude Code]] | 迁移通过 Claude Code 的 Dynamic Workflows / loops / 模型分层执行 | 高 |
