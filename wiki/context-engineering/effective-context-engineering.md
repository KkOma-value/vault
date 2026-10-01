# 有效上下文工程方法论

<!--
内容元数据:
source_raw_files:
  - raw/Effective context engineering for AI agents.md
domain: context-engineering
created: 2026-09-23
updated: 2026-09-23
tags: context-engineering, llm, agents, attention-budget, retrieval, compaction, sub-agents, memory
related:
  - wiki/context-engineering/context-editing.md
  - wiki/context-engineering/human-in-loop-context-curation.md

链接格式规则（Obsidian 可点击）:
- 正文中引用其他知识文件使用 [[domain/topic-file]] 或 [[domain/topic-file|显示标题]]
- 来源备注表中"原始文件"列使用 [[raw/path/file|显示名]] 格式
- 禁止使用反引号包裹路径（Obsidian 不会渲染为可点击链接）
-->

## 摘要

Anthropic 提出"上下文工程"作为提示词工程的进阶：LLM 的核心约束是有限且边际收益递减的注意力预算，好的工程实践是在每一轮推理前持续筛选出最小的高信号 token 集合。文章覆盖系统提示词与工具的设计准则、just-in-time 检索取代全量预检索的趋势，以及长任务三大技术（压缩、结构化笔记、子代理架构）。

---

## 要点

- 上下文工程 ≠ 提示词工程：提示词工程是"把指令写好"的一次性工作；上下文工程是每轮推理都发生的迭代式筛选——决定这次给模型看什么。
- Context rot（上下文腐化）：上下文越长，模型准确召回越差。根源在 Transformer 的 n² 两两注意力关系被拉薄，且训练数据中短序列居多，模型缺乏长程依赖的专门参数。
- 注意力预算：每个新 token 都在消耗预算，因此原则是"用最小的高信号 token 集合最大化期望结果的概率"。注意"最小"不等于"短"——信息要足够完整。
- 系统提示词要找准"正确的高度"：既不是硬编码 if-else 的脆弱逻辑，也不是空泛的高层口号；用 XML / Markdown 分区组织，从最小提示词起步、按失败模式补充。
- 工具设计准则：token 高效、功能不重叠、自包含、容错、用途清晰；臃肿的工具集是最常见失败模式——人分不清该用哪个工具时，Agent 更分不清。
- 示例（few-shot）要精选多样化的典型范例，而不是把一堆边界规则塞进提示词。
- Just-in-time 检索：只在上下文里维护轻量标识符（文件路径、查询语句、链接），运行时用工具动态加载数据；目录结构、命名、时间戳等元数据本身就是引导 Agent 的信号（渐进式披露）。
- 长任务三招：压缩（compaction）、结构化笔记（agentic memory）、子代理架构（sub-agent），分别适配来回沟通多、里程碑清晰、可并行探索三类任务。

---

## 详细内容

### 从提示词工程到上下文工程

Agent 在循环中不断产生"下一轮可能相关"的信息，必须被反复提炼。上下文工程就是把不断膨胀的候选信息宇宙，持续收敛进有限上下文窗口的"艺术与科学"。与写提示词这种离散任务不同，筛选发生在"每次决定把什么传给模型"的时刻。

### 为什么上下文必须省着用

Chroma 的 needle-in-a-haystack 类基准研究提出 context rot：token 越多召回越不准，所有模型都有此现象，只是衰减程度不同。这类似人类有限的工作记忆容量。架构层面的原因：Transformer 让 n 个 token 产生 n² 对注意力关系，上下文一长注意力就被摊薄；训练分布里短序列更常见，模型对全上下文依赖经验不足；位置编码插值（position encoding interpolation）能延长序列但会损失位置理解精度。因此退化是"性能梯度"而非"硬悬崖"——模型在长上下文仍然能干，只是检索精度与长程推理变差。

### 上下文的解剖：各组成部分的设计准则

- **系统提示词**：找准"正确的高度"——足以引导行为，又保留灵活性让模型用强启发式应变。用 `<background_information>`、`<instructions>`、`## Tool guidance` 等分区（XML 标签或 Markdown 标题）。实操：先用最强模型跑最小提示词，再针对失败模式补指令和示例。
- **工具**：定义了 Agent 与其信息/动作空间的契约，返回值必须 token 高效、行为诱导高效。像设计良好的代码库一样：自包含、容错、用途明确；输入参数描述清楚、无歧义。最常见失败模式是臃肿工具集造成功能重叠和选择歧义。
- **示例**：与其罗列边界规则，不如准备少量多样化的典型范例——对 LLM 来说"一图胜千言"。
- 统一原则：informative yet tight。

### 上下文检索与 Agentic Search

Agent 的简洁定义："LLM 在循环中自主使用工具"。工程界正从"推理前用 embedding 预检索"转向"just-in-time"：上下文里只放轻量标识符（文件路径、已存查询、网页链接），运行时用工具按需加载。Claude Code 分析大数据库就是这个路数：写定向查询、存中间结果、用 `head`/`tail` 看数据，从不把全量数据装进上下文——和人类靠文件系统、收件箱、书签做外部索引是一个道理。

标识符的元数据本身就是高效信号：`tests/test_utils.py` 与 `src/core_logic/test_utils.py` 传递不同意图；文件大小暗示复杂度、命名暗示用途、时间戳近似新鲜度。Agent 通过探索逐层组装理解（渐进式披露），只在工作记忆里保留必要内容。

代价：运行时探索比预检索慢，且需要精心设计工具与启发式，否则 Agent 会误用工具、追死胡同。实践中常见混合策略：部分数据预先加载求快、其余自主探索。Claude Code 就是混合型——CLAUDE.md 直接塞进上下文，glob/grep 负责即时导航，顺带绕过索引过期问题。内容动态性低的场景（法律、金融）更适合混合预取。总建议依旧是"do the simplest thing that works"。

### 长任务的三大技术

- **压缩（Compaction）**：对话逼近上下文上限时，总结内容并以摘要开启新窗口。Claude Code 的做法是把消息历史交给模型压缩——保留架构决策、未解决 bug、实现细节，丢弃冗余工具输出，并附加最近访问的 5 个文件。关键在于取舍：过度压缩会丢掉当时看似次要、事后才显关键的上下文。调优建议：先最大化召回（宁多勿漏），再迭代提升精度删冗余。最低风险的入门动作是**工具结果清除**（tool result clearing）——深层历史里的旧工具原始结果没理由再看一遍。
- **结构化笔记（Structured note-taking / agentic memory）**：Agent 定期把笔记写到上下文之外的持久存储，之后再拉回来。类似 Claude Code 的 to-do list 或自维护 NOTES.md。典型例证是 Claude 玩 Pokémon：跨数千游戏步维护精确计数（"最近 1,234 步在 1 号道路练级，皮卡丘离目标 10 级还差 8 级"），自主绘制地图、记录已解锁成就和战斗策略，上下文重置后读自己的笔记继续多小时任务。
- **子代理架构（Sub-agent architectures）**：主 Agent 持高层计划，专职子代理用干净的上下文窗口做深度探索，各自可能消耗数万 token，但只返回 1,000–2,000 token 的蒸馏摘要。关注点分离：检索细节留在子代理里，主 Agent 只做综合分析。Anthropic 的多智能体研究系统实测在复杂研究任务上显著优于单 Agent。

选型：来回沟通多的任务用压缩；里程碑清晰的迭代开发用笔记；可并行探索的研究分析用子代理。模型越强，所需的规约式工程越少，但"把上下文当稀缺资源"这件事不会过时。

---

## 来源备注

| 原始文件 | 位置 | 备注 |
|----------|------|------|
| [[raw/Effective context engineering for AI agents.md\|Effective context engineering for AI agents]] | raw/ | Anthropic Applied AI 团队工程博客，本领域方法论总纲 |
