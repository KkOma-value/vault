# 人在回路的上下文管理框架

<!--
内容元数据:
source_raw_files:
  - raw/Learning Dynamic Context Management in LLMs through Human-in-the-Loop Curation A Proposed Framework From Basic Tools to Hierarchical Abstraction.md
domain: context-engineering
created: 2026-09-23
updated: 2026-09-23
tags: human-in-the-loop, context-management, two-chat, meta-chat, abstraction, pattern-learning
related:
  - wiki/context-engineering/effective-context-engineering.md

链接格式规则（Obsidian 可点击）:
- 正文中引用其他知识文件使用 [[domain/topic-file]] 或 [[domain/topic-file|显示标题]]
- 来源备注表中"原始文件"列使用 [[raw/path/file|显示名]] 格式
- 禁止使用反引号包裹路径（Obsidian 不会渲染为可点击链接）
-->

## 摘要

一篇框架提案（Micheal Bee）：给 LLM 配一个"元层界面"，让用户亲手管理上下文（删、摘要、钉住、重排），系统在旁收集这些管理行为的数据，逐步从人工操作演化为自动的层级抽象能力。核心设计是把"管上下文"和"用上下文"分成两个聊天窗口，避免元讨论污染主对话。

---

## 要点

- 起点判断：FIFO、周期性总结、写满即停这几种现成上下文机制都无法适配用户的具体需求与对话模式，因此先把控制权交给用户。
- 双聊天架构（Two-Chat）：主聊天只保留干净的任务对话；元聊天放管理工具、对主聊天的读权限、管理命令与数据收集。
- 元工作台能力：跨会话检索与引用、上下文库（全部历史可搜索/打标签/多套配置）、按当前任务动态换入换出内容。
- 六个基础工具：Add、Delete（不永久删除，随时可恢复）、Pin（保关键定义/任务参数/决策）、Summarize（摘要与原文并存可切换）、Reorder、Knowledge Building（跨会话沉淀复用模板）。
- 演化路径：基础工具的使用数据 → 学习模式（用户常删什么、常钉什么、何时触发摘要）→ 构建抽象（高层表示、层级关系、按需下钻细节）。
- 三阶段落地：①直接管理（人工 + 数据收集）→ ②辅助管理（建议删除/摘要、模式推荐、人工审批）→ ③智能抽象（自动抽象建议、层级组织、动态抽象层级）。
- 长期方向：个人管理画像、领域化优化、跨会话学习、高级抽象模式。

---

## 详细内容

### 双聊天架构

| 界面 | 职责 |
|------|------|
| Primary Chat | 主对话空间、活动上下文窗口、任务交互、保持干净无杂物 |
| Meta Chat | 上下文管理工具、读取主聊天、管理命令与反馈、为模式学习收集数据 |

价值在于隔离：讨论"这段要不要删"本身也是内容，混进主上下文就等于新的污染源。元聊天读得到主聊天，但不反向污染。

### 元工作台（Meta-Workspace）

- **跨聊天访问**：浏览搜索所有会话、从其他会话导入上下文、组合多来源上下文、追踪内容在会话间的使用。
- **上下文库**：完整对话历史随时可取，任意来源动态选取内容，搜索、筛选、打标签、维护多套上下文配置。
- **主动上下文管理**：按当前任务换入换出内容、混合多会话内容、构造任务专属组合、配置间快速切换。

### 基础工具与数据收集

Add / Delete / Pin / Summarize / Reorder 五个操作都遵循"活动窗口与库分离"原则——删除只是移出活动窗口，内容仍在库里可快速恢复；摘要生成后原文与摘要并存，可在详略视图间切换。第六项 Knowledge Building 负责识别跨会话的重复主题、构建可复用的上下文模板、沉淀跨聊天知识库并追踪讨论演化。

数据收集框架记录工具使用频率、内容保留模式、摘要有效性、用户满意度，以及常见的管理决策、有效的抽象层级、领域模式与个人偏好。这些数据是后续自动化能力的训练素材。

### 从工具到抽象

论文主张的路线是"先实用、后智能"：人工管理的每一步都在为系统提供"什么该保留、什么该丢弃"的标注信号。学到模式之后，系统可以构建高层表示并维护层级关系，同时在需要时保留对细节的访问（与 [[context-engineering/effective-context-engineering|压缩]] 的"保精度再删冗余"思路互补）。最终目标是自适应的上下文管理——按用户习惯和领域特征动态调整抽象粒度。

---

## 来源备注

| 原始文件 | 位置 | 备注 |
|----------|------|------|
| [[raw/Learning Dynamic Context Management in LLMs through Human-in-the-Loop Curation A Proposed Framework From Basic Tools to Hierarchical Abstraction.md\|Learning Dynamic Context Management in LLMs through Human-in-the-Loop Curation]] | raw/ | Medium 论文式提案（2025-01），框架设想而非实测系统 |
