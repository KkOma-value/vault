# Seed String 策略：Discover 阶段的 Agent 架构设计笔记

<!--
内容元数据:
source_raw_files:
  - raw/解析方法论.md
  - raw/How to turn your AI into a world-class designer.md
domain: ai-assisted-workflow
created: 2026-10-01
updated: 2026-10-02
tags: ai-workflow, seed-string, discover, agent-architecture, prompt-engineering, external-randomness
related:
  - wiki/ai-assisted-workflow/ai-design-loop.md
  - wiki/ai-design/world-class-ai-design.md
-->

## 摘要

Seed String 是 AI Design Loop 中 Discover（发散）阶段的核心工程手段：用模型外部产生的真随机字符串作为创意扰动源，把 LLM 拉出"最常见、最安全"的默认设计分布。本笔记把它从方法论翻译成可实现的 Agent 架构：随机源、解码规则、Prompt 模板、并行探索流程、与后续 Define/Deliver 阶段的接口，以及映射到 Ordo 与 Qoder 工作流的具体落地场景。

---

## 1. Seed String 在 Discover 阶段的具体用法

### 1.1 四步执行链

Discover 阶段中，每个探索方向由一个 seed 驱动，固定走四步：

1. **生成 seed（外部随机）**：由 shell / 系统 API 生成长随机字母数字串（建议 12–16 字符，如 `openssl rand -hex 8` 或 Swift `SecRandomCopyBytes`），**绝不让 LLM 自己"假装随机"**——LLM 输出的"随机"仍是分布内产物，扰动无效。
2. **解释 seed 中的模式**：让 Agent 在 seed 里寻找数字、重复片段、异常字符，作为"解读线索"而非直接取值。
3. **映射到 Creative Direction**：把模式映射到可执行的视觉决策——例如数字→色相区间、字符频次→布局密度、重复片段→几何母题、首字符→字体气质；产出一段明确的方向描述（风格参照 + 需要违反的默认规则）。
4. **生成 UI**：按该 Creative Direction 生成界面，seed 本身**不得出现在最终设计中**，它只是一次性扰动源。

### 1.2 在循环中的位置与约束

- 对应九步流程的 **EXPLORE → SELECT**：N 个 seed 并行生成 N 个方向（建议 4–6 个），由人或 Design Director 挑选有潜力的方向进入 DEFINE。
- **必须与大胆 brief 组合使用**：seed 提供分布外扰动，brief 提供世界观约束（"像像素游戏世界、允许不对称与冲突色但整体可用"）。只有 seed 没有 brief，产出会是随机但不可用的方向。
- 每个 seed 是**一次性、不可复现**的（工程上可记录 seed 值以复现某次成功方向，但不作为 PRNG 种子复用——复用会让扰动退化成新的模板）。
- 与温度采样的区别：temperature 仍在原分布内采样；Seed String 通过 prompt 注入外部信息，改变的是**条件分布的锚点**，这是它不能被 `--temp` 替代的原因。

---

## 2. Agent 架构设计

### 2.1 角色划分

```
SeedGenerator (纯工具，无 LLM)
    │  n 个随机串
    ▼
Explorer Agent × n        ← 每个实例：fresh context + 独立 seed + 统一大胆 brief
    │  每实例产出 1 份 CreativeDirection + 1 份 UI 原型
    ▼
Design Director / 人       ← SELECT：横向对比 n 个方向，挑选 1–2 个
    │
    ▼
Implementer ↔ Visual Critic ← 进入既有 Define/Deliver 闭环（本笔记不展开）
```

关键设计决策：

- **SeedGenerator 独立于模型**：单独的工具/函数，输出经结构化字段注入 prompt，不经过任何 LLM 生成。
- **Explorer 用便宜快模型并行**：发散阶段拼数量，贵的强模型留给 Critic / Director（与 ai-design-loop 笔记中的成本分工原则一致）。
- **每实例 fresh context**：避免一个 seed 的产出污染另一个 seed 的方向。

### 2.2 数据结构（最小可用）

```json
{
  "seed": "7f3a9b21c04d",
  "brief_id": "pixel-world-landing",
  "decoded_patterns": {"digits": [7,3,9,2,1], "repeats": ["f3"], "anomaly": "04d"},
  "creative_direction": {
    "palette": "…", "layout_archetype": "…", "typography": "…", "motif": "…",
    "rules_to_break": ["禁止居中 hero + 三卡片 CTA", "…"]
  },
  "artifact_path": "directions/7f3a9b21c04d/index.html",
  "selected": false
}
```

### 2.3 Explorer Prompt 模板骨架

```text
你是一个设计探索 Agent。本次运行的创意种子（外部随机生成，与任务无关）：
SEED: {seed}

1) 在 SEED 中找出：重复片段、数字分布、异常位置。
2) 按以下映射规则把发现转成设计决策：
   - 数字 0-9 → 色相区间（0-360° 均匀分桶）
   - 重复片段 → 贯穿页面的视觉母题
   - 首字符 → 字体气质（衬线/无衬线/等宽/展示体）
   - 奇偶分布 → 布局对称性倾向
3) 输出一段 Creative Direction，并直接实现为一个可打开的页面原型。
4) 约束：遵循 brief（{bold_brief}）；SEED 不得出现在产出中；
   禁止使用默认安全方案（居中 hero、左文右图、紫色渐变、三卡片 CTA）。
```

映射规则应**显式写进 prompt 并跨运行保持稳定**：规则稳定 + seed 随机 = 产出可解释的多样性；规则也让"为什么这个方向长这样"可复盘。

### 2.4 停止条件与验收

- 每轮 Discover 固定 N 个方向后停止（非收敛式，穷举式），把判断留给 SELECT。
- 验收指标：N 个方向两两之间的视觉差异度（可由 Director 打分或用截图 embed 距离粗测）；若多轮后方向仍趋同，优先检查映射规则是否被模型忽略，其次检查 seed 长度是否过短（<8 字符扰动不足）。

---

## 3. 可映射到当前项目的落地场景

### 场景 A（首选，已核验）：Ordo 外派设计类任务时注入 Discover 步骤

Ordo（`/Users/hb41142/Shadow/Sources/Ordo/`）已有把屏幕工作整理成任务并外派给 Agent 的链路：`Managers/TaskDecomposer.swift` 的 `decompose(...)` 向模型（qwen-max）下发 `systemPrompt` + `userPrompt`，产出 `[SuggestedSubTask]`，其中步骤可带 `dispatchToAgent` 动作（target 含 qwenWork / codePilot / qoderWork / workBuddy / workBuddyAI）；`Managers/AgentDispatcher.swift` 负责按 target 派发。

落地方式（2026-10-02 代码核验后确认可行）：

1. 新增 `SeedStringGenerator`：用 `Security` 框架 `SecRandomCopyBytes` 输出 hex/base36、12 字符；Ordo 当前无 `Utils/` 目录（已确认），故放入 `Sources/Ordo/Managers/` 或新建 `Sources/Ordo/Utils/`。
2. 在 `TaskDecomposer.decompose(...)` 中：当识别到 UI/页面/视觉产出类任务时，于 `systemPrompt`（约第 119 行起）追加"Design Explore 模式"规则，于 `userPrompt`（约第 187 行起）注入 §2.3 的 Discover 段，并用 `SeedStringGenerator` 生成 N 个 seed，把单步实现替换为 N 个 `dispatchToAgent` 步骤——每个 `prompt` 携带一个独立 seed + 映射规则 + 大胆 brief，由 Explorer 各自产出 `directions/<seed>/index.html`。
3. SELECT 结果回填到 `Models/` 中的任务状态，供后续 Critic 闭环使用。

改动面小（一个工具类 + 一处 prompt 组装）。与当前修复中的 `AnalysisManager` **确无耦合**：`AnalysisManager` 属录屏 VLM 实时分析子系统（帧队列 / 增量窗口 / 流式合成，见 `enqueueFrame` / `startPipeline` 等），与 `TaskDecomposer` 的任务拆解/外派是两条独立链路，互不调用。

### 场景 B（轻量验证）：Qoder 工作流做 /seed-explore skill

在当前 Qoder 环境用 Bash `openssl rand -hex 8` 当随机源，做一个 Skill：接收 bold brief → 并行跑 N 次 Explorer prompt → 产出 `directions/` 原型页。先用它验证 §2.3 模板和映射规则的有效性，再把稳定版本移植进 Ordo（场景 A）。

---

## 4. 风险与开放问题

- 映射规则本身可能变成新模板（所有方向都"数字→色相"同构）——可准备 2–3 套规则轮换。未验证。
- 视觉差异度的量化指标（embed 距离阈值）无现成基线，需先人工标定一轮。
- Ordo 侧任务类型识别（哪些任务算"设计类"）需要关键词/分类规则，误注入会污染非设计任务的 prompt。

---

## 5. 核验记录（2026-10-02）

本笔记由 Ordo 回执任务驱动，对 §3 场景 A 的 Ordo 引用做了代码级核验，结果如下：

| 核验项 | 结论 |
|--------|------|
| `Managers/TaskDecomposer.swift` 存在且含 `decompose(...)` | ✅ 属实；向 qwen-max 下发 systemPrompt+userPrompt，产出 `[SuggestedSubTask]` |
| `Managers/AgentDispatcher.swift` 存在 | ✅ 属实，负责按 target 派发 |
| `Models/` 目录存在 | ✅ 属实 |
| `Utils/` 目录存在 | ❌ 不存在（笔记原结论"可新建或放入 Managers"准确） |
| 原始剪藏 `raw/How to turn your AI into a world-class designer.md` 存在 | ✅ 属实 |
| "与 `AnalysisManager` 无耦合"声明 | ✅ 成立；`AnalysisManager` 为录屏 VLM 实时分析子系统，与任务拆解/外派链路独立 |
| §2.3 Explorer 模板可落点 | ✅ 已锚定到 `decompose()` 的 prompt 组装与现成的 `dispatchToAgent` 步骤类型 |

**验收自查（逐条）：**

- ① 笔记中明确 Seed String 在 Discover 阶段的具体用法 → 已覆盖（§1.1 四步执行链：生成 seed → 解释模式 → 映射 Creative Direction → 生成 UI；§1.2 循环位置与约束）。**达标。**
- ② 列出至少一个可映射到当前项目的落地场景 → 已覆盖（§3 场景 A：Ordo `TaskDecomposer` 注入 Discover 步骤，已代码核验；场景 B：Qoder `/seed-explore` skill 轻量验证）。**达标。**

**未决/仍标记未知项（保持原状，未补写）：**

- §4 中的映射规则"数字→色相"可能固化为新模板、视觉差异度量化无基线、设计类任务识别误注入风险——均为未验证开放问题，本次仅核验、未做实验验证。
- Seed String 在 Ordo 中的实际运行效果（是否真的拉出分布外方向）尚未在真机跑通，属待实现项，非已证实事实。

---

## 来源备注

| 原始文件 | 位置 | 备注 |
|----------|------|------|
| [[raw/解析方法论.md\|解析方法论]] | raw/ | ChatGPT 对话中对 AI Design Loop / Discover 阶段 Seed String 策略的解析 |
| [[raw/How to turn your AI into a world-class designer\|How to turn your AI into a world-class designer]] | raw/ | Lenny's Newsletter 原文剪藏，随机种子注入的原始出处 |
| [[wiki/ai-assisted-workflow/ai-design-loop\|AI 设计循环]] | wiki/ | 本笔记的上层流程框架 |
| [[wiki/ai-design/world-class-ai-design\|世界级 AI 设计工作流]] | wiki/ | Discover 章节的原始方法论依据 |
