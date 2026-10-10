# AI 设计循环：发散 → Critic 反馈 → 收敛打磨

<!--
内容元数据:
source_raw_files:
  - raw/解析方法论.md
domain: ai-assisted-workflow
created: 2026-09-29
updated: 2026-10-01
tags: ai-workflow, multi-agent, critic-loop, taste, ui-design, design-quality
related:
  - wiki/ui-ux-design/ui-vs-ux.md
-->

## 摘要

把 AI 设计从"一次生成最终稿"改造成借鉴 Double Diamond（双钻设计流程）的三阶段 Agent 工作流：Discover（用外部随机性扩大搜索空间）→ Define（用独立 Design Critic 建立审美反馈闭环）→ Deliver（以删减代替堆砌）。核心命题：不要把 AI 当"设计师"，而要把它组织成一个设计团队。

---

## 要点

- 模型默认输出"最常见、最安全"的设计（紫色渐变、左文右图、CTA 卡片），这不是能力问题而是分布问题——需要外部随机性把模型拉出默认设计分布。
- Implementer 不应自我评价：自己写的代码会产生路径依赖，难以真正推翻；必须引入 fresh context、只看截图的独立 Design Critic Agent。
- 模型分工原则：生成模型负责执行（写代码、改 UI），强模型负责 Taste / Judgment（Critic / Art Director）；强 Critic 只占不到 10% 的输出 token，却能显著提高整体设计质量。
- Coding Agent 天然偏好"代码能轻松生成的东西"（gradient、圆角卡片、blur、glow），应主动提供 Image / Video Generation、3D / Shader 等媒介能力，让 Agent 自己选择表达方式。
- AI 擅长增加元素、不擅长删除：最后阶段的核心问题是 "What can I remove?"，删掉 glow、gradient、多余颜色与容器，尽量改用系统原生组件。
- 这套 Screenshot → 独立 Critic → 修改 → Screenshot 闭环与 worker → reviewer → worker 架构同构，只是 Reviewer 从 Code Reviewer 换成了 Taste Reviewer。

---

## 详细内容

### Discover：先扩大搜索空间，不要一上来就要最终稿

AI 生成的界面容易千篇一律，作者认为原因不是模型能力不够，而是模型天然倾向选择"最常见、最安全"的设计。解决方案有两个：

1. **Seed String（外部随机种子）**：从模型外部产生随机字符串，让 AI 根据它联想颜色、布局、字体和视觉语言，流程是"随机 seed → 解释 seed 中的模式 → 生成 Creative Direction → 生成 UI"。关键点是不要让 LLM 自己"假装随机"，而是给它真正的外部随机性。
2. **大胆的 Design Brief**：不写"做一个漂亮的生产力 App landing page"，而是写"像像素游戏世界一样的 landing page，每个 section 像游戏场景但整体可用"，甚至主动要求"极度不对称、冲突色、不舒服的留白、打破传统网页规则但仍然好看"。

本质是先探索极端方案再收敛，而不是从平均方案开始优化。

### Define：用 Critic Agent 建立审美反馈循环

不让 Coding Agent 自己评价自己的设计，因为实现者知道"为什么这么写"，会产生路径依赖，很难真正推翻自己。因此引入独立的 Design Critic Agent，架构为 Implementer build → Screenshot → Critic feedback → Implementer → repeat。

Critic 的约束：

- 只看截图：不看代码、不看实现理由、不看之前的 critique；
- 每次都用 fresh context；
- 回答固定问题：现在是什么设计语言？顶级设计工作室会做成什么样？当前最大的 gap 是什么？最应该改的 3 件事是什么？
- 可以给质量打分，达到设定标准后才停止迭代。

更深一层的模型分工：便宜快速的模型负责写代码和改 UI，强模型负责 Critic / Art Director。强 Critic 的输出 token 不到总量的 10%，却能显著拉高整体设计质量。

### Define：给 Agent 更多媒介，而不只是写 CSS

Coding Agent 天然喜欢用"代码能轻松生成的东西"，这正是所谓 AI 味（gradient、圆角卡片、几何图形、blur、glow、CSS pattern）的来源。解决方式是主动给 Agent 配备 Image Generation、Video Generation、3D / Shader 与 Browser / Screenshot 工具，让 Agent 自己选择媒介，而不是所有表达都硬用 HTML / CSS 实现。

### Deliver：删减而非堆砌

AI 非常擅长增加元素（标题、解释文案、badge、卡片、gradient、glow、container、icon），但很不擅长删除。因此最后阶段的主要动作是不断问 "What can I remove?"：删掉 glow、gradient、多余颜色、多余 label、多余 container 和自定义但更难看的控件，尽量使用系统原生组件。

### 完整流程与架构抽象

完整的 AI Design Loop 共九步：

EXPLORE 大量生成不同方向 → SELECT 人选择有潜力的方向 → DEFINE 建立 Design Identity → IMPLEMENT Coding Agent 实现 → CRITIQUE 独立 Critic 看截图 → ITERATE 修改、截图、再 critique → ENRICH 图片 / 视频 / shader / motion → REDUCE 删除没有价值的元素 → FINAL 生产级 UI。

对应到 Agent 架构：Explorer Agent → Design Director → Implementer → Visual Critic ↔ Implementer → Polisher。价值判断是：Skill 提供设计知识和规则，Agent Loop 提供搜索、判断和迭代机制——后者比单纯的 design skill 更关键。

---

## 来源备注

| 原始文件 | 位置 | 备注 |
|----------|------|------|
| [[raw/解析方法论.md\|解析方法论]] | raw/ | 对 Lenny's Newsletter《How to turn your AI into a world-class designer》的方法论解析（ChatGPT 对话整理） |
