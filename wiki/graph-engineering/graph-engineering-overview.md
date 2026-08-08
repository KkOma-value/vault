# Graph Engineering：从线性 Agent 到图结构编排

<!--
内容元数据:
source_raw_files:
  - raw/彻底告别Loop Engineering：一文读懂 Graph Engineering.md
domain: graph-engineering
created: 2026-07-21
updated: 2026-07-21
tags: graph-engineering, agent-orchestration, 多agent, 并行, 验证关卡, 路由, dynamic-workflows
related:
  - wiki/claude-code/loops.md
-->

## 摘要

Graph Engineering 是 Agent 工程的第三阶段演进（Prompt → Loop → Graph）。核心思想：不再让单个 Agent 线性执行所有步骤，而是把复杂任务拆成节点图——识别真正的依赖关系，让无依赖任务并行、设置验证关卡、按风险路由、局部容错——从而解决线性 Agent 的慢、贵、上下文爆炸和自我检查盲区问题。

---

## 要点

- **三阶段演进**：Prompt（单次调用）→ Loop（反馈循环，单 Agent 从头管到尾）→ Graph（多节点协作，显式依赖关系）。
- **线性 Agent 四大痛点**：可并行任务被迫排队；同一 Agent 自查盲区；上下文越来越拥挤；一处失败全链停止。
- **Graph 七条设计原则**：
  1. 每个节点只负责一件明确的事（输入/目标/输出/完成条件）。
  2. 无依赖任务不排队——先分后合是最常见 Graph 形状。
  3. 只在真正需要全部结果时才设同步屏障。
  4. 不同输入走不同路径（路由），判断交模型、执行交代码。
  5. 关键位置设硬验证关卡（编译/测试/原始来源），不是加更多 Agent 投票。
  6. 区分失败处理策略：必须成功 / 可降级 / 可跳过。
  7. 循环必须有停止条件（成功标准/最大轮次/无进展检测/预算上限/转人工）。
- **节点间交接比节点本身更重要**：结论+证据+状态+风险+未解决问题，结构化交付而非自由文本。
- **必须有接触现实的节点**：测试通过、编译成功、数据库状态、人工审批——不能只在模型内部循环。
- **Claude Code Dynamic Workflows 是 Graph Engineering 的直接实现**：子 Agent = 节点，`pipeline()` = 并行分支，JS 变量 = 数据交接，if/filter = 条件路由，循环+停止条件 = Graph 中的受控循环。
- **适用场景**：大型代码审查、批量文件迁移、深度研究报告、多来源事实核查、周期性监测。
- **不适用**：单次调用可完成的简单任务、两三步线性流程、连"成功"都未定义的任务。

---

## 详细内容

### Prompt → Loop → Graph 演进

| 阶段 | 核心问题 | 特征 |
|------|----------|------|
| Prompt | 怎样一次说清让模型做对 | 单次调用 |
| Loop | 怎样让模型根据反馈持续行动 | 单 Agent 循环，工具调用+结果判断 |
| Graph | 多模型/多工具/多轮检查时怎样分工协作制约 | 多节点、显式依赖、并行+汇总+验证 |

### 线性 Agent 为什么失控

1. **假排队**：十个文件逐个分析，实际互不依赖。
2. **自查盲区**：生成方案时忽略的问题，复查时仍会忽略（作者≠审稿人）。
3. **上下文膨胀**：搜索结果、工具输出、失败记录全塞同一窗口，早期约束被遗忘。
4. **单点阻塞**：A→B→C 失败→D/E 全停，但 D/E 可能不依赖 C。

### 设计第一张 Graph 的五问

1. 最终要得到什么（具体产出物，非"完成研究"）？
2. 哪些工作可以独立进行？
3. 每步交给下步什么（结构化交接）？
4. 哪些地方必须设硬检查？
5. 失败和停止怎么处理？

### 与 Claude Code Dynamic Workflows 的映射

| Graph 概念 | Workflows 实现 |
|------------|---------------|
| 节点 | 子 Agent |
| 并行分支 | `pipeline()` / `parallel()` |
| 数据交接 | JavaScript 变量 |
| 条件路由 | if / filter / 分支 |
| 循环 | 重复执行 + 停止条件 |
| 汇总节点 | 负责去重、排序、整合的 Agent |
| 图执行者 | Workflow Runtime |
| 图生成者 | Claude |

### 成本提醒

代码控制调度本身不消耗 token，但每个子 Agent 仍消耗 token。工作流适合从小范围开始验证。

---

## 来源备注

| 原始文件 | 位置 | 备注 |
|----------|------|------|
| [[raw/彻底告别Loop Engineering：一文读懂 Graph Engineering\|Graph Engineering 一文读懂]] | raw/ | @AISuperDomain 2026-07-21，引用 Anthropic 官方 Agent 模式文档与 Claude Code Hooks/Workflows 文档 |
