# 多 Agent 协作 / Multi-Agent Coordination

最后更新: 2026-08-18

---
<!--
领域元数据:
domain: multiagent-coordination
created: 2026-08-18
updated: 2026-08-18
tags: multiagent, coordination, 分布式协作, 协议, 死锁, communication-reasoning-gap, 信息孤岛, consensus
summary: 多 Agent 协作的基础研究与协调难题：何时需要多 agent、分布式协调不可消除的问题（共识、死锁、状态一致性）、自然语言通信的局限、专家利用与恶意抵抗的权衡。
-->

## 概览

研究多 Agent 系统在什么条件下才真正需要（而非只是更贵的单 agent），以及一旦进入真正的分布式协作后，面临哪些不可靠 prompt 解决的协调问题——共识崩塌、通信-推理鸿沟、死锁、专家平均化效应。核心结论：真正的 multiagent 运行时必须面对传统分布式系统的协调机制（提交协议、资源排序、锁与租约、幂等操作、终止检测），不能靠行为建议替代可执行协议。

---

## 内容

| 文件 | 标题 | 标签 | 更新日期 | 摘要 |
|------|------|------|----------|------|
| [[multiagent-problems\|多 Agent 协作问题综述]] | 多 Agent 协作问题的初步整理 | multiagent, coordination, 论文综述, 分布式系统 | 2026-08-18 | 四级分类框架 + 8 篇 2026 年论文的核心发现：OneFlow/单 agent 等价、SILO-BENCH 通信-推理鸿沟、专家平均化、死锁率 90%+ |

---

## 来源文件

| 原始文件 | SHA-256 | 对应知识文件 | 处理日期 | 备注 |
|----------|---------|-------------|----------|------|
| [[raw/multiagent 协作问题的初步整理\|multiagent 协作问题的初步整理]] | f60719571ba6 | [[multiagent-problems]] | 2026-08-18 | @chengyongru X thread |

---

## 相关领域

| 领域 | 关系 | 相关度 |
|------|------|--------|
| [[graph-engineering/_index\|Graph Engineering]] | 图结构编排是上层工作流设计，本领域研究底层协调可行性 | 高 |
| [[code-migration/_index\|代码迁移]] | 多 agent 循环的实际应用案例 | 中 |
