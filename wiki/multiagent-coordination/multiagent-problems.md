# 多 Agent 协作问题综述

<!--
内容元数据:
source_raw_files:
  - raw/multiagent 协作问题的初步整理.md
domain: multiagent-coordination
created: 2026-08-18
updated: 2026-08-18
tags: multiagent, coordination, 论文综述, 分布式系统, OneFlow, SILO-BENCH, MAS-BENCH, 死锁, consensus
related:
  - wiki/graph-engineering/graph-engineering-theory.md
-->

## 摘要

基于 8 篇 2026 年顶会论文，系统梳理多 Agent 协作的四级分类，以及每一级别面临的核心问题。结论：前两级（多提示词工作流 / 中央编排专家集合）可被单 agent 等价替代；后两级（分布式协作 / 开放生态）面临不可消除的协调难题，必须引入分布式系统级协议。

---

## 要点

- **四级分类**：多提示词工作流 → 中央编排专家集合 → 分布式协作系统 → 开放式 agent 生态。前两级本质是"复合推理/工作流优化"，后两级才涉及真正的协调问题。
- **单 agent 等价性**（OneFlow [1]）：同一基础模型构建的 multiagent workflow 通常可被一个 agent 多轮上下文模拟，且因 KV cache 复用成本更低。
- **multiagent 成立条件**：必须利用单 agent 没有的条件——不同模型/工具/私有信息/权限/信任域/并行环境动作/不同所有者目标/超长状态。否则只是更贵的单 agent。
- **Communication-Reasoning Gap**（SILO-BENCH [7]）：agent 积极沟通但无法将沟通转化为正确的分布式推理，50+ agent 时成功率降至零。
- **沟通反而降低成功率**（SIGDIAL [8]）：具身协作中，允许对话使动作冲突降低 40-90 个百分点，但任务成功率反而更低——自然语言对话引入了过度确认的协调开销。
- **专家平均化**（ICML [3]）：团队倾向于综合所有人意见做折中，无法正确利用专家。agent 越多平均化越严重。副作用：也能削弱恶意 agent 影响→"利用专家 vs 抵抗恶意"是真实权衡。
- **信任增加一致性但不增加正确性** [4]：让 agent 更友好合作会增加 consensus 但不增加客观准确。
- **死锁率 90-100%**（MAS-BENCH [5][6]）：顺序决策正常的模型，一旦进入资源竞争场景，默认死锁率上限 90%，minimal-prompt 下 100%。
- **必须引入分布式系统协议**：提交协议、资源排序、锁与租约、状态版本、幂等操作、终止检测。不能靠 prompt 中"请避免重复工作"解决。

---

## 详细内容

### 四级协作分类框架

| 层级 | 描述 | 核心问题类型 |
|------|------|-------------|
| 多提示词工作流 | 同一模型扮演 planner/critic/reviewer | 复合推理优化 |
| 中央编排专家集合 | 编排器动态选择模型/工具/subagent | 复合推理优化 |
| 分布式协作系统 | 各 agent 不同信息/状态/工具/权限，无全知节点 | 不可消除的协调问题 |
| 开放式 agent 生态 | 成员/目标/联盟/角色/制度动态变化 | 不可消除的协调问题 |

### 关键论文发现

**前两级可被单 agent 替代：**

- OneFlow [1]：7 个 benchmark 上，多 agent workflow 可被单 agent 多轮模拟，KV cache 复用更省。
- [2]：匹配 thinking-token 上限后，单 agent 匹配或超过多 agent（2 个 multi-hop benchmark × 3 模型 × 5 MAS 架构）。multiagent 收益可能主要来自额外推理计算量。

**后两级的协调崩塌：**

- SILO-BENCH [7]（ACL 2026）：取消预定义角色，信息孤岛下自由协作。agent 积极沟通但推理失败，50+ agent 时成功率→0。
- 具身协作 [8]（SIGDIAL 2026）：沟通降低动作冲突 40-90pp，但任务成功率反而低于静默协作。自然语言可能不是最佳协作协议。
- Multi-Agent Teams Hold Experts Back [3]（ICML 2026）：团队无法正确利用专家，倾向折中所有意见。存在"利用专家 vs 抵抗恶意节点"权衡。
- Relational Priors [4]：信任/友好→一致性↑，客观正确性不变。
- When 20 Agents Fail to Sort / MAS-BENCH [5][6]：全局排序对单机trivial，但 agent 数量增加后共享状态不一致、通信约定不一致、重复提交、无法判断终止。资源竞争场景死锁率 90-100%。

### 核心结论

> "很多论文其实是在研究'多个 ChatGPT 如何聊天'，而不是'多个 agent 如何协作'"

真正的 multiagent 运行时需要的不是行为建议，而是**明确、可执行、可验证的协议**：提交协议、资源排序、锁与租约、状态版本、幂等操作、终止检测。

---

## 来源备注

| 原始文件 | 位置 | 备注 |
|----------|------|------|
| [[raw/multiagent 协作问题的初步整理\|multiagent 协作问题的初步整理]] | raw/ | @chengyongru X thread, 2026-08-17, 含 8 篇参考文献 |
