# Multi-Agent 工作流成本优化 / Agent Cost Optimization

最后更新: 2026-08-22

---
<!--
领域元数据:
domain: agent-cost-optimization
created: 2026-08-22
updated: 2026-08-22
tags: agent-cost, token优化, context-engineering, prompt-cache, progressive-disclosure, 多agent成本, cli-over-mcp
summary: Multi-Agent 工作流的 token 成本治理：先度量后优化，围绕"只加载需要的上下文、剔除无关上下文、消除重复上下文"三原则展开的工程实践（渐进式披露、稳定前缀、CLI 替代 MCP、代码图谱、并行调用等）。
-->

## 概览

Multi-Agent 系统跑起来之后第一个问题往往是钱烧得快且不知道烧在哪。本领域关注 harness 工作流层面的 token 成本治理方法论：先建度量看清六类消耗来源（系统提示词、工具返回、文件读取、长期记忆、历史消息、用户提示词），再按三原则系统性压缩——①让 AI 只看到当前需要的上下文；②减少无关上下文；③减少重复上下文。核心洞察：省 token 不等于功能降级，最贵的冗余是"每个 Agent 各自重新发现同一份信息"，最省钱的调用是不调用。

---

## 内容

| 文件 | 标题 | 标签 | 更新日期 | 摘要 |
|------|------|------|----------|------|
| [[multi-agent-cost-optimization\|腾讯 10 个优化点降本 50%+]] | 靠这10个优化点，我们把Multi-Agent工作流成本降了50%以上 | agent-cost, token优化, prompt-cache, 渐进式披露, rtk, graphify, 并行调用 | 2026-08-22 | TL+6 子 Agent 全流程开发工作流的成本专项：AgentLens 度量拆账 + 三原则十方向改造，端到端 token -55.5%，全流程预估 -50%~65% |

---

## 来源文件

| 原始文件 | SHA-256 | 对应知识文件 | 处理日期 | 备注 |
|----------|---------|-------------|----------|------|
| [[raw/靠这10个优化点，我们把Multi-Agent工作流成本降了50%以上\|Multi-Agent 成本降 50%]] | f3ae77cbe999 | [[multi-agent-cost-optimization]] | 2026-08-22 | 腾讯技术工程公众号 |

---

## 相关领域

| 领域 | 关系 | 相关度 |
|------|------|--------|
| [[graph-engineering/_index\|Graph Engineering]] | 多 Agent 拆分/Wave 编排/并行派发是图结构编排的具体应用；模型分层路由与图课程中的 model tiering 呼应 | 高 |
| [[agent-platform/_index\|Agent 平台]] | 成本优化的对象是 harness 工作流；harness 四要素（system prompt/tools/loop）正是消耗来源的结构性解释 | 高 |
| [[multiagent-coordination/_index\|多 Agent 协作]] | 本领域从成本视角回答"何时值得拆多 Agent"：小需求单 Agent 直做，拆分本身有成本 | 中 |
