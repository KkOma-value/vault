# Multi-Agent 工作流成本优化 / Agent Cost Optimization

最后更新: 2026-08-31

---
<!--
领域元数据:
domain: agent-cost-optimization
created: 2026-08-22
updated: 2026-08-31
tags: agent-cost, token优化, context-engineering, prompt-cache, progressive-disclosure, 多agent成本, cli-over-mcp, software-factory, managed-agents, pareto-frontier, code-mode, context-graph
summary: Multi-Agent 与软件工厂工作流的 token 成本治理：先度量后优化（6因子成本方程/AgentLens拆账），围绕"只加载需要的上下文、剔除无关上下文、消除重复上下文"三原则展开的工程实践（Pareto模型选型、分层Prompt Cache TTL、CLI替代MCP/Tool Search、Code-Mode批处理、AI Context Graph、16种会话反模式诊断）。
-->

## 概览

Multi-Agent 系统与规模化软件工厂跑起来之后，首要挑战往往是 Token 成本增长过快且消耗链路不透明。本领域关注 Harness 与 Agent 工作流层面的系统性治理方法论：
1. **度量与拆账**：建立多维度成本方程（如 Uber 6 因子公式：`Spend = Users × Sessions × Requests × Turns × Tokens × Price`）与会话链路拆解工具（AgentLens、Session Analysis Dashboard），看清系统提示词、Schema 膨胀、盲搜探索、无用轮次与历史消息等核心消耗源。
2. **系统性压缩与优化**：
   - **单价与路由**：真实 Benchmark 驱动的 Pareto 最优前沿动态切流，Subagent 默认降级执行。
   - **请求负载压降**：400k tokens 触发 Compaction，Reasoning Effort 默认 Medium，分层 Prompt Cache TTL（长交互 1 小时 vs 短 Subagent 5 分钟），CLI 替代 MCP + Tool Search 消除 Schema 膨胀，Code-Mode 消除工具轮询。
   - **探索轮次消除**：企业级 AI Context Graph / 代码依赖图谱将多轮盲搜降为单次精准命中。
3. **战略演进**：从优化分散不可控的交互式个人终端，走向平台 100% 控制 Harness、模型路由与治理策略的 Managed Agents 舰队。

核心洞察：省 Token 不等于功能降级，最贵的冗余是"每个 Agent 各自重新发现同一份信息"，最省钱的调用是不调用。

---

## 内容

| 文件 | 标题 | 标签 | 更新日期 | 摘要 |
|------|------|------|----------|------|
| [[multi-agent-cost-optimization\|腾讯 10 个优化点降本 50%+]] | 靠这10个优化点，我们把Multi-Agent工作流成本降了50%以上 | agent-cost, token优化, prompt-cache, 渐进式披露, rtk, graphify, 并行调用 | 2026-08-22 | TL+6 子 Agent 全流程开发工作流的成本专项：AgentLens 度量拆账 + 三原则十方向改造，端到端 token -55.5%，全流程预估 -50%~65% |
| [[uber-software-factory-cost-efficiency\|Uber 规模化软件工厂成本与效率治理]] | Running a Software Factory Efficiently at Uber Scale | agent-cost, software-factory, managed-agents, pareto-frontier, code-mode, context-graph | 2026-08-31 | Uber 软件工厂（WAU 7x、请求 9.4x、>70% PR 涉及 Agent）成本治理：6 因子成本方程、Pareto 模型选型、分层 Cache TTL、CLI 替代 MCP、Code-Mode、24M 节点 Context Graph、16 种反模式看板，单会话成本降 52% |

---

## 来源文件

| 原始文件 | SHA-256 | 对应知识文件 | 处理日期 | 备注 |
|----------|---------|-------------|----------|------|
| [[raw/靠这10个优化点，我们把Multi-Agent工作流成本降了50%以上\|Multi-Agent 成本降 50%]] | f3ae77cbe999 | [[multi-agent-cost-optimization]] | 2026-08-22 | 腾讯技术工程公众号 |
| [[raw/Running a Software Factory Efficiently at Uber Scale\|Uber Software Factory 成本效率]] | d5eeb87bbc51 | [[uber-software-factory-cost-efficiency]] | 2026-08-31 | Uber Engineering 博客，作者 Uday Kiran |

---

## 相关领域

| 领域 | 关系 | 相关度 |
|------|------|--------|
| [[agent-fleet/_index\|Agent 舰队]] | Uber 核心战略是从交互式终端全面转向受控 Managed Agents 舰队；与 ABC Legal 舰队治理理念互为支撑 | 高 |
| [[graph-engineering/_index\|Graph Engineering]] | 多 Agent 拆分/Wave 编排/并行派发是图结构编排的具体应用；模型分层路由与图课程中的 model tiering 呼应 | 高 |
| [[agent-platform/_index\|Agent 平台]] | 成本优化的对象是 harness 工作流；harness 四要素（system prompt/tools/loop/translation）正是消耗来源的结构性解释 | 高 |
| [[multiagent-coordination/_index\|多 Agent 协作]] | 本领域从成本视角回答"何时值得拆多 Agent"：小需求单 Agent 直做，拆分本身有成本 | 中 |
| [[pi-agent/_index\|Pi 代理框架]] | Uber 规模化采用的 400k tokens Compaction 机制与 Pi 的上下文压缩设计理念高度契合 | 中 |
| [[claude-code/_index\|Claude Code]] | Reasoning Effort 默认设为 Medium 对应 Claude Code 模型与努力度权衡实践 | 中 |
