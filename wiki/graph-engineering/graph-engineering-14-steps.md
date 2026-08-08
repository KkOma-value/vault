# Graph Engineering 14 步路线图：从零到图架构师

<!--
内容元数据:
source_raw_files:
  - raw/Graph Engineering with Claude 14-Step roadmap from 0 to graph architect (Full Course).md
domain: graph-engineering
created: 2026-07-26
updated: 2026-07-26
tags: graph-engineering, agent-orchestration, dynamic-workflows, parallel, pipeline, fan-out, verifier, schema, model-tiering
related:
  - wiki/graph-engineering/graph-engineering-overview.md
  - wiki/code-migration/code-migration-methodology.md
-->

## 摘要

一份从线性 Agent 到图架构师的 14 步完整课程。以 Claude Code Dynamic Workflows 为实现载体，逐步讲解节点/边概念、fan-out/fan-in、diamond 拓扑、运行时路由、对抗式验证、循环收敛、模型分层和自路由图，附 6 个即刻可练的实战图形。

---

## 要点

- 线性 Agent 是退化图（degenerate graph）：每步只有一条出边，无冗余、无并行。
- 核心判断法则：下一步是否读取上一步的输出？无数据流动 = 无真实边 = 可并行。
- 节点必须有合约（schema）——bounded input、validated output、one job，才能被安全编排。
- 边本身是数据合约；大量"组合结果"操作是边（plain JS），不需要 agent。
- `parallel()` 是 barrier（等全部完成）；`pipeline()` 无 barrier（item 独立流过各 stage）——默认用 pipeline。
- Diamond 拓扑（fan-out → reduce → synthesize）是大多数严肃 Agent 图的骨架。
- 验证器（verifier）放在边上过滤结果：adversarial verify / perspective-diverse verify / judge panel。
- 循环（cycle）用 loop-until-dry 收敛：连续 K 轮无新发现则停止；去重对象是 seen 集合而非 confirmed。
- 模型分层：重复性节点用便宜模型，判断性节点用贵模型——图结构让分层显而易见。
- 拓扑决定成本与延迟，parallel vs pipeline 选择是最大杠杆。
- 自路由图：说 "workflow" → Claude 自写编排脚本；ultracode 模式自动为每个实质任务规划 workflow。

---

## 详细内容

### 14 步结构一览

| 步骤 | 主题 | 核心操作 |
|------|------|----------|
| 01 | 节点与边 | 节点 = 一个 agent job；边 = 输出→输入的数据流 |
| 02 | 线性即退化图 | 审视每条"and then"是否真有数据流 |
| 03 | 节点合约 | schema 强制 bounded input / validated output |
| 04 | 边即数据合约 | edge 是 shape 承诺，非执行顺序；reduce 操作用 JS 不用 agent |
| 05 | fan-out: parallel() | N 独立节点并行；barrier 等全部完成；单节点失败 → null |
| 06 | fan-in: barrier | 仅当需要跨 item 上下文时才加 barrier（dedup / rank / early-exit） |
| 07 | diamond 拓扑 | split → parallel work → merge；记住"fan-out → reduce → synthesize" |
| 08 | 运行时路由 | router node 用 agent 分类，code 走 if/switch 路由 |
| 09 | 验证器 | adversarial / perspective-diverse / judge panel 三种模式 |
| 10 | 故障隔离 | thunk throw → null；worktree 隔离并行文件写入 |
| 11 | 循环收敛 | loop-until-dry；dedupe vs seen（非 confirmed）；K=2 空轮停止 |
| 12 | 模型分层 | 重复节点 → 便宜模型；判断节点 → 贵模型；`model` 选项逐节点覆盖 |
| 13 | 拓扑 = 成本 × 延迟 | 默认 pipeline()；barrier 仅限跨 item 依赖场景 |
| 14 | 自路由图 | "workflow" 触发 Claude 自写编排；ultracode 全量自动；`s` 保存脚本 |

### 关键设计原则补充（相对 overview 的增量）

1. **边不花 token** —— flatten/dedupe/filter 是 `results.flatMap(...)` + `Set`，不是 agent 调用。
2. **parallel() vs pipeline() 嗅探测试** —— 如果 parallel → transform → parallel 中间 transform 无跨 item 依赖 → 应改 pipeline。
3. **循环去重陷阱** —— dedupe 必须对 `seen`（所有历史发现）而非 `confirmed`（已验证发现），否则被拒的发现反复出现，循环永不干燥。
4. **模型分层经济学** —— 图让节点的判断权重可见化：fan-out 中重复节点下调模型，merge 节点保持顶级。
5. **保存与复用** —— workflow 脚本保存到 `.claude/workflows/`，version-controlled、可按名复用。

### 6 个实战练习图

| 图形 | 拓扑 | 适用场景 |
|------|------|------- 安全扫描 | fan-out(每路由一 agent) → verifier | 路由鉴权审计 |
| /deep-research | scope → parallel search → fetch → adversarial verify → synthesize | 带引用报告 |
| 模块移植 | fan-out(每文件翻译) → test gate → 失败回循环 | Bun 式 port |
| 对抗式 diff review | router(diff 大小) → quick/full parallel audit → judge panel | PR 审查 |
| 定时生态扫描 | parallel(多源) → barrier rank → digest | 保存复用 |
| 未知规模发现 | loop-until-dry(finders → dedupe vs seen → diverse-lens verify) | Bug sweep |

---

## 来源备注

| 原始文件 | 位置 | 备注 |
|----------|------|------|
| [[raw/Graph Engineering with Claude 14-Step roadmap from 0 to graph architect (Full Course)\|14-Step Graph Engineering]] | raw/ | @0xCodez, 2026-07-20, Twitter thread + Substack |
