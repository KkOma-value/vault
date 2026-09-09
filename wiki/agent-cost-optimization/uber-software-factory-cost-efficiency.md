# Uber 规模化软件工厂的成本与效率治理 / Software Factory at Uber Scale

<!--
内容元数据:
source_raw_files:
  - raw/Running a Software Factory Efficiently at Uber Scale.md
domain: agent-cost-optimization
created: 2026-08-31
updated: 2026-08-31
tags: agent-cost, software-factory, managed-agents, pareto-frontier, prompt-cache, cli-over-mcp, code-mode, context-graph, session-analysis, token优化, uber
related:
  - wiki/agent-cost-optimization/multi-agent-cost-optimization.md
  - wiki/agent-fleet/abc-legal-managed-agents.md
  - wiki/agent-platform/codex-as-platform.md
  - wiki/pi-agent/pi-compaction.md
  - wiki/claude-code/model-vs-effort.md

链接格式规则（Obsidian 可点击）:
- 正文中引用其他知识文件使用 [[domain/topic-file]] 或 [[domain/topic-file|显示标题]]
- 来源备注表中"原始文件"列使用 [[raw/path/file|显示名]] 格式
- 禁止使用反引号包裹路径（Obsidian 不会渲染为可点击链接）
-->

## 摘要

Uber 工程团队在全生命周期落地 AI 软件工厂（Software Factory），在全公司（工程师与非工程师）WAU 增长 7 倍、周请求量增长 9.4 倍、>70% PR 涉及 Agent（3,600+ skills、30K+ 日执行次）的超大规模落地背景下，总 AI 支出不仅未失控反而趋于平稳，每千次请求模型成本下降 34%，单会话成本自峰值下降 52%。其核心方法论是：将 Agent 会话组织为四层架构，建立由六个乘积项构成的成本方程（`Total Spend = Users × Sessions/User × Requests/Session × Turns/Request × Tokens/Turn × Price/Token`），在保持业务采纳增长的同时，针对中间环节系统性运用 Pareto 选型、分层 Prompt Cache TTL、CLI 替代 MCP、Code-Mode 批处理、AI Context Graph 消除盲搜、以及 16 种会话反模式诊断；战略重心从分散的交互式终端会话全面转向全托管 Managed Agents。

---

## 要点

- **成本六因子乘积方程**：`总支出 = 活跃用户数 × 单用户会话数 × 单会话请求数 × 单请求轮次数 × 单轮Token数 × 单Token单价`。前两项代表采纳与活跃度（鼓励持续增长），中间三项代表 Agent 自身衍生工作量（核心治理目标），最后一项由模型选型与供应商单价决定。
- **软件工厂四层架构**：从底至顶分别为：①交互式单 Agent 终端（Interactive CLI）；②Skills 与自定义 Loops；③受控 Managed Workflows；④全自主 Managed Agents（如 uReview 代码审查、自愈 CI、E2E PR 视觉验证、On-call 告警分流）。层级越高，平台对模型选型、成本与质量的控制力越强。
- **Pareto 前沿驱动的模型选型**：用真实场景 PR 构建评测基准（如 uReview Benchmark），在统一 Harness 下横评前沿与开源模型，在"完成成本 vs 质量 vs 延迟"的 Pareto 前沿上动态切换模型；交互界面中默认将 Subagent 路由至廉价模型（主模型负责规划拆解与评测，Subagent 负责执行）。
- **Token / Request 压降四大杠杆**：
  1. **Compaction 与推理努力度默认值**：1M 上下文模型亦默认在 400k tokens 触发自动压缩；Reasoning Effort 默认设为 Medium。
  2. **Prompt Cache TTL 分层策略**：交互式会话工程师思考间隙长（常 >5 分钟），将 TTL 从 5 分钟提升至 1 小时，避免缓存失效导致全额冷启动重算；短生命周期 Subagent 保持 5 分钟 TTL。
  3. **CLI 替代 MCP + Tool Search**：统一 MCP Gateway 汇聚 1,000+ 工具，将 MCP 投影为 Shell CLI 与动态按需搜索（Tool Search），彻底消除 50k~70k tokens 的 Schema 常驻开销。
  4. **Code-Mode（代码模式）**：将传统 MCP 逐次交互+轮询重构为 Python 子进程批处理脚本，大模型只看最终汇总，单任务 token -50% 以上，批量流降幅达 90% 以上。
- **Requests / Turn 治理（AI Context Graph）**：未经图谱接地的 Agent 容易陷入多轮代码翻找与盲搜；构建 2400 万节点、8000 万边、集成 30+ 内部系统的企业上下文知识图谱，使 Agent 从 20 分钟多轮报错缩短至 38 秒精准定位。
- **从交互式转向 Managed Agents**：优化分散在数千名工程师终端里的单次会话 ROI 极低，将 SDLC 工作流迁移至受控的 Managed Agents 舰队，平台拥有 100% 的 Harness 与模型路由控制权。

---

## 详细内容

### 1. 软件工厂四层架构与成本方程

```
【Layer 4】自主 Managed Agents（uReview 代码审查、自愈 CI、E2E PR 验证、On-call 分流）  ▲ 控制力最高
【Layer 3】受控 Managed Workflows（固定模板、自动化流水线）                          │
【Layer 2】Skills 与自定义 Loops（工程师编排的工作流）                                │
【Layer 1】交互式单 Agent 终端（Interactive CLI / Chat）                              ▼ 控制力最低
```

#### 成本拆解方程

$$\text{Total Spend} = \underbrace{\text{Users} \times \frac{\text{Sessions}}{\text{User}}}_{\text{业务采纳与渗透（鼓励增长）}} \times \underbrace{\frac{\text{Requests}}{\text{Session}} \times \frac{\text{Turns}}{\text{Request}} \times \frac{\text{Tokens}}{\text{Turn}}}_{\text{Agent 内部衍生开销（核心优化区间）}} \times \underbrace{\frac{\text{Price}}{\text{Token}}}_{\text{模型选型与计价}}$$

### 2. 优化杠杆一：Price / Token（模型单价与路由）

#### Benchmark 驱动的 Pareto 模型选型
- **构建真实基准**：以实际代码库与真实任务构建 Benchmark（如将真实 PR 分为 Easy/Medium/Hard 三级），评测 Precision、Recall、F1、单次成本、延迟与噪音。
- **通用 Harness 抽象**：在统一接口后接入 Frontier 模型与开源权重模型，绘制 Pareto 最优前沿曲线（Pareto Frontier），只要前沿发生转移（几周一次）即自动平滑切流。
- **典型案例（uReview）**：Uber 的 AI PR 代码审查工具通过模型切换，在 F1 分数显著提升的同时，使单 PR 审查成本呈现断崖式下降。

#### Subagent 默认降级路由
- 随着多 Agent 编排能力提升，调用 Subagent 的会话比例大幅攀升。
- Subagent 通常执行输入明确、范围清晰的子任务，并不需要 Frontier 模型的极高推理能力。
- 策略：主模型负责任务拆解与最终评估，**Subagent 默认路由到更低成本、高吞吐的模型**（允许工程师显式覆盖）。

### 3. 优化杠杆二：Tokens / Request（单请求 Token 负载）

#### 默认配置约束
- **400k Compaction 阈值**：即使底层模型支持 1M 上下文，也在达到 400k tokens 时主动触发压缩（参考 [[pi-agent/pi-compaction|Pi 上下文压缩机制]]），平衡长窗口模型性能衰减与缓存抖动。
- **Reasoning Effort 设为 Medium**：思考 Token（Thinking Tokens）单价通常是输入 Token 的数倍，对于绝大多数日常研发任务，Medium 推理努力度在质量与成本之间达到最佳平衡点（参考 [[claude-code/model-vs-effort|Claude Code 模型与努力度]]）。

#### 分层 Prompt Cache TTL 策略
- **痛点**：供应商（Anthropic/OpenAI）缓存读取仅为标准输入单价的 0.1x，但缓存写入有溢价（5 分钟 1.25x，1 小时 2.0x）。
- **策略分层**：
  - **交互式开发者终端**：由于工程师阅读和思考常超过 5 分钟，默认 5 分钟 TTL 会频繁失效并引发全额重算；因此全面改为 **1 小时 TTL**，极大提升了缓存命中率。
  - **Subagent 执行环境**：子 Agent 属于单次短命任务，因此保持 **5 分钟 TTL**，避免不必要的长缓存写入加价。

```
交互终端 (Interactive)   ──[ 思考间隔 > 5min ]──>  1 小时 Cache TTL（稳定命中 0.1x 读单价）
子代理 (Subagents)       ──[ 短命单次任务    ]──>  5 分钟 Cache TTL（降低写入溢价）
```

#### CLI 替代 MCP + Tool Search（Schema 瘦身）
- **MCP Schema 膨胀问题**：Uber 接入 1,000+ internal & SaaS MCP 工具。如果把工具 Schema 全部预装进 Prompt，初始系统上下文直接暴增 50K~70K tokens，且随每轮对话反复计费。
- **解决方案**：
  - **CLI Tool Resolution**：将 MCP Gateway 背后的 1,000+ 工具统一投影为终端 Shell 命令，模型按需执行 CLI，会话中完全不携带 MCP Schema（参考 [[agent-cost-optimization/multi-agent-cost-optimization|腾讯 10 点降本中的 CLI 替代 MCP 实践]]）。
  - **Tool Search 动态按需加载**：大模型通过关键词搜索工具目录，仅将命中工具的极简定义加载进上下文。

#### Code-Mode（代码模式批处理）
- **传统 MCP 的轮询浪费**：以 SQL 查询为例，传统 MCP 需要：发起查询（Turn 1）→ 轮询状态 2~5 次（Turn 2~5）→ 获取结果（Turn 6）。每一次轮询的中间状态全部滚雪球堆积在 Context 中。
- **Code-Mode 方案**：编写预置的 Code-Mode Python 脚本，将轮询与数据清洗逻辑放在 Python 子进程中运行，模型仅需一次调用，且只接收最终 Summary。
- **收益**：单查询 Token 减少 >50%；批量工作流（Bulk Workflows）减少 >90%。

### 4. 优化杠杆三：Requests / Turn（减少无效翻找与盲搜）

#### AI Context Graph（企业上下文知识图谱）
- **问题根源**：未接地的 Agent 在庞大 monorepo 和数千张数据表中花费大量轮次做盲搜（Ungrounded Search），不仅多消耗 20+ 分钟，且极易因超长上下文引发幻觉或报错。
- **架构**：Uber 建设了包含 **2400 万节点、8000 万边（86 类节点、117 类边）** 的 AI Context Graph，连通服务、团队、故障复盘、PR、架构设计文档、部署状态及历史表查询日志。
- **实测对比**：
  - **无图谱 Agent**：翻找代码库 20 分钟、派生 2 个子 Agent、触发 3 次报错，最终误判数据表不可查。
  - **图谱接地 Agent**：查询图谱中 50+ 分析师的历史查询模式，**38 秒** 精准定位并完成任务。

### 5. 可见性与反模式治理

#### 实时感知与预算阶梯
- **Statusline 实时计数器**：终端状态栏常驻当前会话与全局累计消耗金额。
- **共享预算池（Harness Pool）**：跨工具共享梯度配额，并在 50%、80%、100% 触发 Slack 自动预警与轻量审批流。

#### 会话分析看板（Session Analysis Dashboard）与 16 种反模式诊断
运行时自动分析本地与远程 Sandbox 的 Trace 记录，精准检测 16 种高频浪费反模式：
1. **模型路由过配**：简单任务错误使用 Opus 等超大模型。
2. **Context 脏数据残留**：40KB 以上的单次工具原始返回残留在后续轮次反复计费。
3. **缓存过期抖动**：长时间离开后恢复会话导致的冷启动重算。
4. **Prompt 初始化过重**：用户尚未输入即预载 100k tokens 的系统提示词与工具定义。

---

## 腾讯 vs Uber 成本治理对比

| 治理维度 | 腾讯实践 ([[agent-cost-optimization/multi-agent-cost-optimization\|10 个优化点]]) | Uber 实践（Software Factory at Scale） |
|---------|-----------------------------------------------------------------------------------|---------------------------------------|
| **核心场景** | Tech-Leader 全流程研发多 Agent 编排 | 全公司规模化 Software Factory 与 Managed Agents |
| **度量体系** | AgentLens 拆解 Wave 粒度账单 | 6 因子成本乘积方程 + 16 种会话反模式诊断看板 |
| **MCP 治理** | CLI 替代 MCP、rtk 压缩命令行输出 | MCP Gateway CLI 投影 + Tool Search + Code-Mode |
| **图谱应用** | graphify 代码依赖图谱（AST+语义） | AI Context Graph（2400万节点企业级知识网络） |
| **缓存策略** | 稳定前缀、动态内容后置、状态外化 | 1 小时（交互） vs 5 分钟（Subagent）分层 TTL |
| **战略归宿** | 提示词瘦身与 Wave 架构约束 | 全面从交互终端迁移至受控 Managed Agents 舰队 |

---

## 来源备注

| 原始文件 | 位置 | 备注 |
|----------|------|------|
| [[raw/Running a Software Factory Efficiently at Uber Scale\|Uber Software Factory 成本效率]] | raw/ | 作者 Uday Kiran (@udaykiran)，Uber Engineering，2026-08-29 |
