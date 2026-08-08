# Claude Code

最后更新: 2026-07-14

---
<!--
领域元数据:
domain: claude-code
created: 2026-07-09
updated: 2026-07-14
tags: claude-code, llm, 模型, 努力程度, token, loops, 代理循环
summary: Claude Code 的使用原理与配置，包括模型选择、努力程度、token 消耗、代理循环（loops）等。
-->

## 概览

关于 Claude Code 的工作原理与使用策略：模型（model）与努力程度（effort）两个核心设置如何影响输出、成本与行为；以及如何用循环（loops）让代理重复执行工作周期直到满足停止条件。涵盖结果不理想时如何排查上下文并选择正确的设置。

---

## 内容

| 文件 | 标题 | 标签 | 更新日期 | 摘要 |
|------|------|------|----------|------|
| [[model-vs-effort\|模型与努力：知道更多还是努力更多]] | Claude Code 中的模型与努力 | claude-code, 模型选择, 努力程度, token | 2026-07-09 | 模型决定 Claude 知道多少，努力决定它做多少工作；出错时先查上下文再判断该换模型还是提高努力。 |
| [[agent-loops\|循环入门：四类循环与何时使用]] | Claude Code 的循环（loops）入门 | claude-code, loops, /goal, /loop, /schedule | 2026-07-14 | 代理重复执行工作周期直到满足停止条件；分回合制、目标驱动、时间驱动、主动式四类，各自交出检查/停止条件/触发时机/prompt。 |

---

## 来源文件

| 原始文件 | SHA-256 | 对应知识文件 | 处理日期 | 备注 |
|----------|---------|-------------|----------|------|
| [[raw/《克劳德密码》中的模型与努力：知道更多还是努力更多\|《克劳德密码》中的模型与努力]] | 3ae866666d90 | [[model-vs-effort]] | 2026-07-09 | x.com/ClaudeDevs 剪藏 |
| [[raw/Getting started with loops\|Getting started with loops]] | 4c790b5c198d | [[agent-loops]] | 2026-07-14 | x.com/ClaudeDevs 剪藏，@delba_oliveira 撰写 |

---

## 相关领域

| 领域 | 关系 | 相关度 |
|------|------|--------|
| [[pi-agent/_index\|Pi 代理框架]] | 同为编码代理/框架，扩展与 SDK 概念可对照 | 中 |
| [[graph-engineering/_index\|Graph Engineering]] | Loops 是 Graph 的前一阶段；Dynamic Workflows 是 Graph Engineering 在 Claude Code 中的实现 | 高 |
| [[code-migration/_index\|代码迁移]] | 大规模代码迁移通过 Claude Code 的 loops / Dynamic Workflows / 模型分层执行 | 高 |
