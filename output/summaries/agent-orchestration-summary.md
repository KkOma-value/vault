# Agent 编排方法论全景摘要：从 Loop 到 Graph

<!--
输出元数据:
type: summary
generated: 2026-08-14
source_wiki_files:
  - wiki/claude-code/agent-loops.md
  - wiki/claude-code/model-vs-effort.md
  - wiki/graph-engineering/graph-engineering-overview.md
  - wiki/graph-engineering/graph-engineering-14-steps.md
  - wiki/code-migration/large-scale-migration.md
  - wiki/pi-agent/pi-extensions-and-sdk.md
  - wiki/pi-agent/pi-compaction.md
source_raw_files:
  - raw/Getting started with loops.md
  - raw/《克劳德密码》中的模型与努力：知道更多还是努力更多.md
  - raw/彻底告别Loop Engineering：一文读懂 Graph Engineering.md
  - raw/Graph Engineering with Claude 14-Step roadmap from 0 to graph architect (Full Course).md
  - raw/How Anthropic runs large-scale code migrations with Claude Code.md
  - raw/Pi 代理 101 - 如何扩展和构建自己的线束.md
  - raw/How Compaction Works in Pi.md
tags: agent-orchestration, graph-engineering, loops, model-tiering, judge, compaction
-->

## 摘要

把"让 AI 干活"这件事拆成可工程化的系统，是知识库中沉淀最厚的一条主线。脉络清晰：**Prompt → Loop → Graph** 三阶段演进；Claude Code 侧给出循环（loops）与模型/努力（model vs effort）两套控制面，Graph Engineering 给出把复杂任务画成节点图的七条设计原则与 14 步落地路线，Anthropic 的代码迁移案例证明"修流程不修代码"的规模化可行性；Pi 框架则展示了"默认极简 + 一切可扩展"的另一极，以及长会话的上下文压缩（compaction）机制。本文摘要是这 7 份知识文件的跨领域整合。

---

## 一、演进主线：Prompt → Loop → Graph

| 阶段 | 核心问题 | 特征 |
|------|----------|------|
| Prompt | 怎样一次说清让模型做对 | 单次调用，靠提示词质量 |
| Loop | 怎样让模型根据反馈持续行动 | 单 Agent 循环：工具调用 + 结果判断，直到停止条件 |
| Graph | 多模型/多工具/多轮检查时怎样分工制约 | 多节点、显式依赖、并行 + 汇总 + 验证关卡 |

线性 Agent（单 Agent 从头管到尾）有四大痛点：① 可并行任务被迫排队（假排队）；② 同一 Agent 自查有盲区（作者 ≠ 审稿人）；③ 上下文不断膨胀，早期约束被遗忘；④ 一处失败全链停止，而下游可能根本不依赖它。

---

## 二、Loop 层：四类循环 + 模型/努力两个控制面

### 循环 = 代理重复执行工作周期，直到满足停止条件

| 循环类型 | 你交出什么 | 何时使用 | 原语 |
|----------|-----------|----------|------|
| Turn-based 回合制 | 检查（the check） | 探索/做决定，短任务 | 自定义验证 skills |
| Goal-based 目标驱动 | 停止条件 | 知道"完成"长什么样 | `/goal` |
| Time-based 时间驱动 | 触发时机 | 工作按排程发生、在项目之外 | `/loop`、`/schedule` |
| Proactive 主动式 | prompt 本身 | 工作重复且定义明确，无人参与 | 上述全部 + 动态工作流 + auto mode |

关键心态：**不是所有任务都需要复杂循环**，从最简单的方案起步、选择性使用。循环质量取决于周围系统——干净的代码库、可自我验证的手段（skill）、可达的文档、第二个审查代理；单次结果不达标时，把它固化进系统（而不是只修个例），改善后续所有迭代。

### 模型（model）与努力（effort）：知道更多 vs 做更多

- **模型**决定 Claude"知道多少"：切换的是哪一组冻结权重，同时决定每个输出 token 的单价，但不决定生成多少 token。
- **努力**决定"做多少工作"：读多少文件、验证多少、多彻底才认为完成；高努力更倾向复核，但不会在简单任务上人为膨胀。
- 结果不满意时：先查上下文（prompt/工具/skills/可自我验证方式），再问是"不够懂（换大模型）"还是"不够努力（提高努力档）"。
- 经济账：例行工作降级到小模型省钱不损质量；真正吃力的大任务上，大模型用更少步骤达到同样质量，总成本反而可能更低。
- 落地策略（在循环/Graph 中反复出现）：**重复性节点用便宜模型，判断性节点用贵模型——模型分层**。

---

## 三、Graph 层：把任务画成图

### 七条设计原则

1. 每个节点只负责一件明确的事（输入/目标/输出/完成条件）。
2. 无依赖任务不排队——"先分后合"是最常见的 Graph 形状。
3. 只在真正需要全部结果时才设同步屏障（barrier）。
4. 不同输入走不同路径：判断交模型（router），执行交代码（if/switch）。
5. 关键位置设硬验证关卡（编译/测试/原始来源），不是加更多 Agent 投票。
6. 区分失败处理策略：必须成功 / 可降级 / 可跳过。
7. 循环必须有停止条件（成功标准/最大轮次/无进展检测/预算上限/转人工）。

### 14 步路线图要点（实现载体：Claude Code Dynamic Workflows）

- 线性 Agent 是退化图（degenerate graph）；判断法则：**下一步是否读取上一步的输出？无数据流动 = 无真实边 = 可并行**。
- 节点必须有合约（schema）：bounded input、validated output、one job。
- 边即数据合约：大量"组合结果"操作（flatten/dedupe/filter）是普通 JS，**不花 token、不需要 agent**。
- `parallel()` 是 barrier（等全部完成）；`pipeline()` 无 barrier（item 独立流过各 stage）——**默认用 pipeline**；拓扑选择是成本 × 延迟的最大杠杆。
- Diamond 拓扑（fan-out → reduce → synthesize）是大多数严肃 Agent 图的骨架。
- 验证器放边上：adversarial verify / perspective-diverse verify / judge panel 三种模式。
- 循环收敛用 loop-until-dry：连续 K 轮无新发现则停；**去重对象是 seen（历史全部发现）而非 confirmed**，否则被拒发现反复出现、循环永不干燥。
- 自路由图：说 "workflow" → Claude 自写编排脚本；ultracode 模式自动为实质任务规划 workflow，脚本保存到 `.claude/workflows/` 版本化管理。

### 实践映射（Graph ↔ 实现）

| Graph 概念 | 实现 |
|------------|------|
| 节点 | 子 Agent |
| 并行分支 | `pipeline()` / `parallel()` |
| 数据交接 | 结构化交付（结论 + 证据 + 状态 + 风险 + 未解决问题） |
| 条件路由 | if / filter / 分支 |
| 汇总节点 | 负责去重、排序、整合的 Agent |
| 硬检查 | 编译、测试、原始来源、人工审批——必须有接触现实的节点 |

---

## 四、工程验证：大规模代码迁移案例

Anthropic 内部一个月内用多 agent 循环迁移 10 个几万到几十万行的代码包（Bun Zig→Rust、Mike Python→16.5 万行 TS），核心洞见：

- **你不修代码，你修产出代码的流程**：审查者反复抓到同类错误 → 给 rulebook 加一句话 → 重新生成受影响文件，代码永远不被打补丁对齐规则。
- **先建可信 judge**：测试分类 → 改写为可移植断言（对抗 agent 确认没削弱）→ 用"故意改坏代码"验证 judge 会失败。
- **对抗式审查 + 机械化验证**：两个对抗审查者用独立上下文评估；编译器错误列表、冒烟测试、双代码库行为 diff 是机械化真值来源；build daemon 串行化最昂贵的重建。
- **模型分层落地**：大模型做审查者与规则编写者，小模型承担高并发实现 fan-out。
- **缺测试套件不阻塞迁移**：让 Claude 造一个（7 个真实场景脚本 + 四晚自主修复），原始代码库始终是 ground truth。
- 结果看 loop 不看代码：Bun 移植上生产后内存降 89%、二进制小 19%、快 2~5×。

---

## 五、框架的另一极：Pi 的极简 + 可扩展

Claude Code 系解决"怎么编排"，Pi 框架回答"框架本身怎么造"：

- 默认只有 4 个工具（bash/read/write/edit），其余能力全部靠 **TypeScript 扩展**添加；`pi.*`（注册）、`pi.on(event)`（生命周期钩子）、`ctx.*`（实时会话）暴露几乎所有挂钩点；`/reload` 热重载，代理可在运行时重写自己的框架。
- 挂钩点可透明拦截上下文：pi-hypa 清理 bash 输出削减 80%~98% token，代理无感知。
- 不只是 CLI，而是五包 SDK（pi-ai / pi-agent / pi-coding-agent / TUI / orchestrator），整个代理可坍缩为一次函数调用；资源加载器（resource loader）为每个 session 划定范围，多租户后端跑 `SessionManager.inMemory()` 以自有 DB 为事实源。
- **上下文压缩（compaction）**：长会话输入超出窗口时，用一次独立 LLM 请求把历史总结成结构化摘要（目标/进展/关键决策），保留最近约 2 万 token（5~20 轮），纯文本存储跨模型可移植；代价是打破 prompt cache（前缀变了需重新计算），之后的请求会重新建缓存。

---

## 六、贯穿始终的工程原则（速查）

1. **停止条件先于任务定义**：不知道"成功"长什么样，就不该开循环或建图。
2. **接触现实**：测试、编译、真实数据、人工审批必须出现在链路上，不能只在模型内部循环。
3. **结构化交接**：节点之间交的是"结论 + 证据 + 状态 + 风险 + 未解决问题"，不是自由文本。
4. **机械化一切可机检的事**：脚本比逐步推理便宜且可断点续跑（按磁盘文件判断完成度）。
5. **模型分层**：重复性工作降级、判断性工作升级；努力档位按领域偏好设，而非逐任务调。
6. **小范围先跑**：动态工作流可能生成上百个代理，先在小切片上验证用量与质量。
7. **留退路**：迁移最坏情况只是"删分支重来"——把不确定性变成可逆操作。

---

## 来源备注

| 知识文件 | 主题 | 原始文件 |
|----------|------|----------|
| [[claude-code/agent-loops|四类循环]] | 循环定义与选择 | raw/Getting started with loops.md |
| [[claude-code/model-vs-effort|模型与努力]] | 两个控制面 | raw/《克劳德密码》中的模型与努力.md |
| [[graph-engineering/graph-engineering-overview|Graph 概述]] | 七原则与演进 | raw/彻底告别Loop Engineering.md |
| [[graph-engineering/graph-engineering-14-steps|14 步路线图]] | 图设计细节 | raw/Graph Engineering with Claude 14-Step roadmap.md |
| [[code-migration/large-scale-migration|大规模代码迁移]] | 工程验证案例 | raw/How Anthropic runs large-scale code migrations.md |
| [[pi-agent/pi-extensions-and-sdk|Pi 扩展与 SDK]] | 框架极简主义 | raw/Pi 代理 101.md |
| [[pi-agent/pi-compaction|Pi 上下文压缩]] | 长会话机制 | raw/How Compaction Works in Pi.md |
