# 告别"线性 Agent"：Graph Engineering 入门指南

<!--
输出元数据:
type: draft
status: 草稿 v1（待补示意图、待校对代码示例）
generated: 2026-08-14
source_wiki_files:
  - wiki/graph-engineering/graph-engineering-overview.md
  - wiki/graph-engineering/graph-engineering-14-steps.md
  - wiki/code-migration/large-scale-migration.md
source_raw_files:
  - raw/彻底告别Loop Engineering：一文读懂 Graph Engineering.md
  - raw/Graph Engineering with Claude 14-Step roadmap from 0 to graph architect (Full Course).md
  - raw/How Anthropic runs large-scale code migrations with Claude Code.md
tags: graph-engineering, agent-orchestration, dynamic-workflows, 文章草稿, 多agent
-->

> 草稿说明：对外文章草稿 v1。目标读者：已经让单 Agent 干过活、但被"慢、贵、上下文爆炸、自查盲区"困扰的开发者。实现载体以 Claude Code Dynamic Workflows 为主（公开文档 + 14 步课程），Anthropic 代码迁移案例作为工程验证。

---

## 开头（钩子）

如果你已经用 AI 编码代理干过几周活，大概率经历过这些时刻：

- 让它一次分析 10 个文件，它老老实实一个一个来——明明彼此毫无依赖，却排了两小时队。
- 它写出来的方案有 bug，你让它自查，它检查完说"没问题"——因为它生成时就忽略了那个问题，复查时照样忽略。
- 干到一半，上下文窗口塞满搜索记录、工具输出、失败日志，早期的需求约束被忘得一干二净。
- 中间一步失败，后面所有步骤全停——可后面的步骤根本不依赖它。

这不是你不会用提示词，是**单 Agent 线性执行的天花板**。解法是换一种编排方式：Graph Engineering——把任务画成一张图，让该并行的并行、该验证的验证、该绕路的绕路。

## 一、三句话理解演进

- **Prompt 时代**：怎么一次说清，让模型做对。单次调用。
- **Loop 时代**：怎么让模型根据反馈持续行动。单 Agent 循环，工具调用 + 结果判断。
- **Graph 时代**：多模型/多工具/多轮检查时，怎么分工、怎么制约。多节点、显式依赖、并行 + 汇总 + 验证。

注意：Graph 不是取代 Loop，而是 Loop 的组织方式升级——图里的每个节点内部，往往还是一个带停止条件的循环。

## 二、Graph 的七条设计原则（背下来就够用了）

1. **每个节点只负责一件明确的事**：写清楚输入、目标、输出、完成条件。
2. **无依赖任务不排队**："先分后合"是最常见的 Graph 形状。
3. **只在真正需要全部结果时才设同步屏障**——大多数情况不需要。
4. **不同输入走不同路径**：判断交给模型（router 节点），执行交给代码（if/switch）。
5. **关键位置设硬验证关卡**：编译、测试、原始来源核对。不是加更多 Agent 投票。
6. **区分失败处理策略**：必须成功 / 可降级 / 可跳过。
7. **循环必须有停止条件**：成功标准、最大轮次、无进展检测、预算上限、或转人工。

## 三、一张图的设计练习：五问

拿到任务先别急着开干，回答五个问题：

1. 最终要得到什么？——要"具体产出物"，不是"完成研究"。
2. 哪些工作可以独立进行？——**判断法则：下一步是否读取上一步的输出？无数据流动 = 无真实边 = 可并行。**
3. 每步交给下步什么？——结构化交接：结论 + 证据 + 状态 + 风险 + 未解决问题。
4. 哪些地方必须设硬检查？——必须有接触现实的节点：测试通过、编译成功、真实数据、人工审批。
5. 失败和停止怎么处理？

## 四、直接上手：14 步路线图里的核心武器

以下摘自一份从零到图架构师的 14 步课程，只讲最常用的五个武器：

### 1. 节点要有合约（schema）

每个节点必须是 bounded input、validated output、one job。没有合约的节点无法被安全编排——你不知道它输入什么、输出什么，图就失控了。

### 2. 边不花 token

大量"组合结果"操作（flatten / dedupe / filter / sort）是普通 JavaScript，不是 agent 调用。**能写在边上的逻辑，不要做成节点。** 这是最容易省钱的点。

### 3. parallel vs pipeline：最大杠杆

- parallel() 是 barrier——等全部完成再继续。
- pipeline() 无 barrier——每个 item 独立流过各阶段。
- **默认用 pipeline**；只有需要跨 item 上下文（去重、排序、early-exit）时才加 barrier。
- 嗅探测试：如果结构是 parallel → transform → parallel，且中间 transform 无跨 item 依赖，就该改成 pipeline。

### 4. Diamond 拓扑：严肃图的骨架

fan-out（拆分）→ reduce（归并）→ synthesize（综合）。记住这个形状：大多数正经 Agent 图都是它。

### 5. 循环收敛：loop-until-dry

连续 K 轮无新发现就停止（K=2 常见）。**去重必须对 seen（历史所有发现）而非 confirmed（已验证发现）**——否则被拒的发现反复出现，循环永不干燥。

## 五、工程验证：Anthropic 是怎么迁移 100 万行代码的

方法论不能只看理论。Anthropic 内部的真实案例：一个月内迁移 10 个几万到几十万行的代码包（Bun Zig→Rust、Python→TS），核心是"实现—审查—修复"的多 Agent 循环：

- **你不修代码，你修产出代码的流程**：审查者反复抓到同类错误 → 给 rulebook 加一句话 → 重新生成受影响文件。
- **先建可信 judge**：没有可信判据就没有退出条件——测试分类、改写为可移植断言、用"故意改坏的代码"验证 judge 会失败。
- **对抗式审查 + 机械化验证**：两个对抗审查者用独立上下文评估；编译错误、冒烟测试、行为 diff 是机械化真值来源。
- **模型分层**：大模型做审查者和规则编写者，小模型承担高并发实现。
- 经济账变了：最坏情况从"两套代码库并行数年"变成"删分支重来"。

这正是一个 Graph：实现 fan-out + 验证关卡 + 循环收敛 + 模型分层的完整实例。

## 六、反模式清单（自查）

- ❌ 给单个 Agent 塞 10 个互不依赖的任务，让它排队干。
- ❌ 用同一 Agent 既写代码又审查代码。
- ❌ 把 flatten/dedupe 这种 JS 操作做成 Agent 节点。
- ❌ 到处加 barrier，把所有并行变成串行。
- ❌ 循环没有停止条件，或对 confirmed 去重导致永不收敛。
- ❌ 所有节点用同一个最强模型——重复性工作白花 token。

## 结尾（金句位）

线性 Agent 问"下一步做什么"，Graph 问"谁和谁可以同时做、谁该检查谁"。前者把复杂度堆在上下文里，后者把复杂度画在结构上。**第一次画图不求完美——先把一个重复三次以上的手动流程拆成节点，你就已经毕业了。**

---

## 附：写作待办

- [ ] 补 1~2 张图（演进对比图、diamond 拓扑图）
- [ ] 补一个可运行的 pipeline() 最小示例（用 Claude Code Workflows 语法，校对后）
- [ ] 引用 Anthropic 官方代码迁移文章链接
- [ ] 标题二选一："告别线性 Agent" vs "Agent 编排的下一个阶段"

---

## 来源备注

| 知识文件 | 主题 | 原始文件 |
|----------|------|----------|
| [[graph-engineering/graph-engineering-overview|Graph 概述]] | 演进与七原则 | raw/彻底告别Loop Engineering.md |
| [[graph-engineering/graph-engineering-14-steps|14 步路线图]] | 武器库与实战图形 | raw/Graph Engineering with Claude 14-Step roadmap.md |
| [[code-migration/large-scale-migration|大规模代码迁移]] | 工程验证案例 | raw/How Anthropic runs large-scale code migrations.md |
