# 用 AI 做设计：品味驱动的工作流

<!--
内容元数据:
source_raw_files:
  - raw/How To Actually Design With AI.md
domain: ai-design
created: 2026-07-15
updated: 2026-07-15
tags: ai-design, ui-design, 品味, 工作流, 设计技能, inspiration-board, prompt
related:
  - wiki/claude-code/_index.md
-->

## 摘要

用 AI 做设计不等于让它替你做一切。想法、方向、感觉与创意仍必须来自人；AI 只负责**执行**。AI 懂设计规则（间距、排版、色彩理论、层级），但不懂**品味（taste）**——它不知道什么是原创、有意义或真正好的东西，这就是差距所在。文章给出三条绕过这一局限的路径：用现成设计技能（最快）、逐组件亲手带 AI 设计（最慢但质量最高）、用灵感板（inspiration board）折中（平衡）。核心结论：更好的结果不来自更好的 prompt，而来自更好的品味。

---

## 要点

- 分工原则：人负责想法/方向/感觉/创意，AI 负责执行。你本质上是在把思路转成指令。
- AI 懂设计规则但无品味；品味无法直接注入，只能通过流程与参考库绕过。
- 三种方法各有取舍：设计技能（快、够用）、逐组件（慢、最高质量）、灵感板（平衡）。
- 亲手设计要「先意义后形式」：先定清楚给谁用、解决什么问题、该有什么感觉，UI 要反映产品的意义。
- 收集参考时要问「为什么好」（布局/间距/排版/结构/交互），分类归档，长期积累即是在培养品味。
- 逐组件构建：给 AI 小任务（「按这个风格做一个 hero，适配我的品牌」）而非「给我做整个网站」，AI 在小任务上表现更好，你也保留控制权。
- 可让 AI 反过来问你问题来澄清方向；生成自定义素材（图/SVG/视频）比通用素材库更显整体一致。

---

## 详细内容

### 分工与「品味差距」

设计一直是 AI 难以匹敌人类的领域，但多数人误解了「用 AI 设计」的含义：它不是把一切丢给 AI，而是**人给方向、AI 做执行**。工具（Cursor、Codex、Claude 或任意 harness）本质上都是把你的想法转成指令。AI 能极好地执行，理解间距、typography、色彩理论、层级等规则——但它不懂 taste，不知道什么原创、有意义或真正好。品味无法直接给到 AI，只能想办法绕过这一限制。

### 方法一：使用设计技能（Design Skill）——最快

时间紧或做小东西时，直接依赖现成设计技能。文中列举：Impeccable、Emil Kowalski 的 UI skills、Skills.sh、TasteSkill。流程：加技能 → 给 AI 上下文 → 多次 prompt 生成站点/应用/海报 → 修明显问题 → 发布。结果通常不错，好技能能避开最糟的 slop，但可能与其他 AI 生成物雷同。这是大多数人的做法。

### 方法二：逐组件亲手带 AI 设计——最慢、质量最高

想要真正出彩、让人一眼感到「用心了」的东西，需要更刻意的流程：

- **先意义后形式（Start With Meaning）**：先回答「给谁用 / 解决什么问题 / 该有什么感觉 / 代表什么」，写下来。可以让 AI 在这一步**反过来问你问题**（产品是什么、受众、想传达的感觉、品牌调性、配色与字体、是极简/俏皮/高级/技术/实验风），但不是让它做设计。
- **收集灵感（Collect Inspiration）**：强来源是 Mobbin（真实产品界面，多品类）。不要只看「好看」，要问「为什么好」——布局？间距？排版？结构？交互？把有用的存下来，按 Navigation / Heroes / Pricing / Cards / Mobile screens / Dashboards / Animations / Typography 等分类归档。长期积累自己的参考库，这就是培养品味的方式。其他来源：Pinterest、Cosmos、Awwwards、Webflow Templates、Craftwork、Rebrand Gallery、Component Gallery、Savee、Lummi。**不要整体照抄，把多个想法组合成适合自己产品的东西。**
- **梳理结构（Map the Structure）**：定清楚要做什么。网站常见：Navigation / Hero / Features / Pricing / Testimonials / CTA / Footer；应用常见：Onboarding / Home / Search / Profile / Settings / Core flows / Empty states。每个区块需有明确内容（如 hero 需要 Headline / Description / CTA / Visual）。AI 可帮写文案，但清晰度仍来自你。
- **逐组件构建（Build Component by Component）**：从参考中取单个想法并适配。不要说「给我做整个网站」，而说「按这个风格做一个 hero，适配我的品牌」。按 Navigation → Hero → Cards → Buttons → Typography → Details 一步步来。AI 在小任务上表现好得多，你也保留控制权。
- **生成自定义素材（Generate Custom Assets）**：需要时用图像生成（GPT Images 2.0、Seedream 5.0 已足够强），给清楚上下文（配色/风格/构图/用途）。避免通用库存图，自定义视觉让整体更协调。

完整工作流（10 步）：定义想法 → 明确目的与受众 → 定品牌方向 → 收集参考 → 整理参考 → 梳理结构 → 构建组件 → 生成素材 → 加交互 → 整体打磨。远胜于一次性 prompt。

### 方法三：灵感板（Inspiration Board）——折中

不逐件手搭，而是给 AI 一组精选参考。从 Mobbin、Awwwards、Webflow、Craftwork、Rebrand Gallery、Component Gallery、Savee、Cosmos、Pinterest 收集截图，然后告诉 AI：「把这些参考的风格与方向融合成我产品的设计，不要直接照抄。」仍要先给足上下文、让 AI 提问、再生成。比通用 prompt 好得多，又比全手工快。

### 三种方法对比

1. 设计技能：快，结果够用。
2. 逐组件：慢，质量最高。
3. 灵感板：平衡。

### 补充工具

- **SVG 生成**：Quiver 生成 SVG，元素分离便于做更好的动画。
- **视频**：Google Flow 等，可增强 hero、背景、产品演示。
- **图库**：Lummi 等，注意匹配品牌。
- **分层（Layering）**：用抠图与分层增加深度、动态与交互；小细节带来大差别。

### 最终结论

AI 不应替代你的思考。你仍决定：做什么、为何重要、给谁、该有什么感觉。AI 只是帮你更快执行。最好的结果不来自更好的 prompt，而来自**更好的品味**。

---

## 来源备注

| 原始文件 | 位置 | 备注 |
|----------|------|------|
| [[raw/How To Actually Design With AI\|How To Actually Design With AI]] | raw/ | 作者 [@LexnLin](https://x.com/LexnLin)，来源 x.com（发布 2026-07-13，剪藏 2026-07-15）；含 Mobbin 联盟链接 |
