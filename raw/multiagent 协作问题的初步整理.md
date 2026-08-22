---
title: "multiagent 协作问题的初步整理"
source: "https://x.com/chengyongru/status/2089289757138575737"
author:
  - "[[@chengyongru]]"
published: 2026-08-17
created: 2026-08-18
description: "最近在研究multiagent collaboration, 做了一些调查, 写一篇文章做一些总结, 这应该会是第一篇我们先来做一些定义方面的工作, 方便后续的讨论层级描述多提示词工作流同一个模型分别扮演 planner, critic, reviewer中央编排的专家集合一个编..."
tags:
  - "clippings"
---
![Image](https://pbs.twimg.com/media/HP6iCcZbAAAhkV3?format=jpg&name=large)

最近在研究multiagent collaboration, 做了一些调查, 写一篇文章做一些总结, 这应该会是第一篇

我们先来做一些定义方面的工作, 方便后续的讨论

| 层级 | 描述 |
| --- | --- |
| 多提示词工作流 | 同一个模型分别扮演 planner, critic, reviewer |
| 中央编排的专家集合 | 一个编排器动态选择模型, 工具或subagent |
| 分布式协作系统 | 各 agent 拥有不同信息, 状态, 工具或权限, 没有单一全知节点 |
| 开放式 agent 生态 | 成员, 目标, 联盟, 角色和制度都可能动态变化 |

表格中前两类问题更多的属于**复合推理 / 工作流优化**, 2026 年的两篇论文讨论了这类问题.

**OneFlow** 发现, 在七个 benchmark 上, 使用同一基础模型构建的 multiagent workflow, 通常可以由一个 agent 通过多轮上下文模拟, 并且因为 KV cache 复用而成本更低\[1\].

另一篇文章在匹配 thinking-token 上限后发现, 在两个 multi-hop reasoning benchmark, 三个模型家族和五种 MAS 架构上, 单 agent 能够匹配或超过多 agent. 这说明至少在这类文本推理任务中, 许多 multiagent 收益可能主要来自额外的推理计算量\[2\].

所以我们大致能推导出一个结论, 一个multiagent workflow要成立, 至少得证明它利用了某种**单 agent 没有的条件**, 譬如: 不同模型, 工具或真实能力; 不同的私有信息或上下文; 不同的权限和信任域; 必须并行执行的环境动作; 不同所有者, 目标或激励; 超出单 agent 可承载范围的长期状态等等, 否则它大概率只是一个更昂贵的单 agent workflow.

到了第三, 第四类问题, 我们就开始涉及不可消除的协调问题.

ACL 2026 的 **SILO-BENCH** 刻意取消了预定义角色, 让 agent 在信息孤岛下自由协作, 每个 agent 只持有一部分真相, 要求他们通过沟通拼出完整信息, 结果是agent 的确在积极沟通, 但是沟通并没有真正把消息转化为正确的分布式推理, 而且随着任务和 agent 数量增加, 性能急剧下降, 在最复杂的一类任务中, agent 数量达到 50 及以上时, 成功率甚至降到了零, 他们把这种情况称作 Communication-Reasoning Gap\[7\].

SIGDIAL 2026 的具身协作结果也很有意思, 在一个共享的环境中, 做了一组对比实验, 对照组agent之间静默协作, 实验组则可以互相对话, 结果是, 实验组的两个 agent 的动作冲突下降了约 40-90 个百分点, 但最终任务成功率反而低于静默协作\[8\]. 这里我举个例子你们大概就懂为什么任务完成率更低了😅:

```text
a: 我要搬桌子.
b: 收到.
a: 你确定?
b: 确定.
a: 那我开始.
b: 好的.
```

这两篇论文都主要让 agent 通过自然语言沟通, 但自然语言真的是最佳协议吗? 对于人类来说, 自然语言是必须的, 因为我们的大脑无法直接共享状态. (所以我现在越来越怀疑, **很多论文其实是在研究"多个 ChatGPT 如何聊天", 而不是"多个 agent 如何协作"**).

ICML 2026 的 **Multi-Agent Teams Hold Experts Back** 研究的则是没有固定工作流的自由协作团队. 结果是即使明确告诉团队谁是真正的专家, 团队仍然常常无法正确利用专家, 团队倾向于综合所有人的意见, 对正确专家和错误成员给出的方案进行折中, agent 越多, 这种平均化越严重, 没错, 就像你想的那样, 无论你提出了一个多么愚蠢的想法, LLM大概率会先告诉你, 你说的对!

有趣的一点是, 这种倾向也能降低恶意 agent 的影响, 因此存在"利用专家"与"抵抗恶意节点"之间的真实权衡\[3\].

**Relational Priors as Convergence Pressure** 也得出相似观察, 让 agent 彼此更加信任, 合作和友好, 会增加一致性, 但不一定增加客观正确性\[4\].

当agent数量进一步增加, 连简单的一致性甚至都无法维持, **When 20 Agents Fail to Sort** 在 MAS-BENCH 中让每个 agent 只看到数组的一部分, 大家协作完成全局排序, 这个任务对单机算法而言极其简单, 但 agent 数量增加后, 共享状态不一致, 通信约定不一致, 多个 agent 重复提交, 无法一致判断任务是否已经结束, 种种问题涌现出来\[5\], 他们还提出了一种叫 CAMOC 的轻量级协调机制, 尝试解决这类问题, 这里不再展开有兴趣的朋友可以简单了解一下.

MAS-BENCH 还发现, 在顺序决策中表现正常的模型, 一旦进入同时竞争资源的场景, 默认设置下死锁率上限为 90%, 在特定 minimal-prompt 设置下则达到 100%. ok, 允许自然语言交流也不一定解决问题(我真的什么也没有影射).\[6\]

这些结果意味着, 真正的 multiagent 运行时必须重新面对传统分布式系统中的协调问题. 在工程系统中, 这往往会具体表现为提交协议, 资源排序, 锁与租约, 状态版本, 幂等操作和终止检测等机制.

这些问题不能靠 prompt 里泛泛地说一句"请避免重复工作"来解决. 无论规则最终被编码在运行时还是 prompt 中, 它都必须成为一套明确, 可执行, 可验证的协议, 而不是行为建议.

并且最难绷的其实是在这个 multiagent 系统中, 我们甚至很难找出是谁导致了失败. fine, 幸好agent不需要在项目复盘会上互相甩锅😼（注：这个表情其实是在我测试nanobot的多session通信功能时发现的，nanobot拟补了橘猫里没有龙傲天的遗憾， 在x上这个表情并那么传神）.

![Image](https://pbs.twimg.com/media/HP6lR_SbsAArNFM?format=png&name=large)

好了, 看到这里我觉得你已经累了, 暂时先聊到这里, 我会尽快找时间更新🤔

参考文献

\[1\] [https://arxiv.org/abs/2601.12307](https://arxiv.org/abs/2601.12307)

\[2\] [https://arxiv.org/abs/2604.02460](https://arxiv.org/abs/2604.02460)

\[3\] [https://arxiv.org/abs/2602.01011](https://arxiv.org/abs/2602.01011)

\[4\] [https://arxiv.org/abs/2608.03239](https://arxiv.org/abs/2608.03239)

\[5\] [https://aclanthology.org/2026.findings-acl.1698](https://aclanthology.org/2026.findings-acl.1698)

\[6\] [https://arxiv.org/abs/2602.13255](https://arxiv.org/abs/2602.13255)

\[7\] [https://aclanthology.org/2026.acl-long.1354.pdf](https://aclanthology.org/2026.acl-long.1354.pdf)

\[8\] [https://aclanthology.org/2026.sigdial-1.21](https://aclanthology.org/2026.sigdial-1.21)