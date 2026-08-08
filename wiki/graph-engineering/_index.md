# Graph Engineering / 图结构 Agent 编排

最后更新: 2026-07-26

---
<!--
领域元数据:
domain: graph-engineering
created: 2026-07-21
updated: 2026-07-26
tags: graph-engineering, agent-orchestration, 多agent, 并行, 验证关卡, 路由, dynamic-workflows
summary: 把复杂 Agent 任务从线性流水线重构为图结构：节点拆分、并行分支、验证关卡、条件路由、局部容错，以及 Claude Code Dynamic Workflows 的实践映射。
-->

## 概览

Graph Engineering 是 Prompt Engineering → Loop Engineering 之后的第三阶段 Agent 工程方法论。核心主张：复杂任务不应由单个 Agent 线性执行，而应识别任务内在的依赖结构，将其展开为节点图——无依赖并行、有依赖串行、关键位置设验证关卡、不同输入走不同路由、失败局部隔离。Claude Code 的 Dynamic Workflows 是目前最直接的实现路径。

---

## 内容

| 文件 | 标题 | 标签 | 更新日期 | 摘要 |
|------|------|------|----------|------|
| [[graph-engineering-overview\|Graph Engineering 概览]] | Graph Engineering：从线性 Agent 到图结构编排 | graph-engineering, agent-orchestration, 并行, 验证关卡, 路由 | 2026-07-21 | 三阶段演进、线性 Agent 痛点、七条设计原则、交接规范、Claude Code Workflows 映射 |
| [[graph-engineering-14-steps\|14 步路线图]] | 从零到图架构师完整课程 | graph-engineering, dynamic-workflows, parallel, pipeline, fan-out, verifier, schema | 2026-07-26 | 14 步渐进教学：节点/边、fan-out/in、diamond、路由、验证器、循环收敛、模型分层、自路由图 |

---

## 来源文件

| 原始文件 | SHA-256 | 对应知识文件 | 处理日期 | 备注 |
|----------|---------|-------------|----------|------|
| [[raw/彻底告别Loop Engineering：一文读懂 Graph Engineering\|Graph Engineering 一文读懂]] | a53f50aacd71 | [[graph-engineering-overview]] | 2026-07-21 | @AISuperDomain |
| [[raw/Graph Engineering with Claude 14-Step roadmap from 0 to graph architect (Full Course)\|14-Step Graph Engineering]] | 6f22ec5077ff | [[graph-engineering-14-steps]] | 2026-07-26 | @0xCodez |

---

## 相关领域

| 领域 | 关系 | 相关度 |
|------|------|--------|
| [[claude-code/_index\|Claude Code]] | Graph Engineering 通过 Dynamic Workflows 在 Claude Code 中实现 | 高 |
| [[code-migration/_index\|代码迁移]] | 大规模迁移的"实现—审查—修复"多 agent 循环、并行 fan-out、验证关卡是 Graph Engineering 的落地形态 | 高 |
