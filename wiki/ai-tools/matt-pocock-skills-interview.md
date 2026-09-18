# Matt Pocock Skills 访谈：grill me 与 wayfinder 工作流

<!--
source_raw_files:
  - raw/264K🌟 Skills 作者 Matt Pocock 96 分钟访谈：grill me 与 wayfinder 工作流，25 年前老书中藏着答案.md
domain: ai-tools
created: 2026-09-18
updated: 2026-09-18
tags: agent-skills, matt-pocock, grill-me, wayfinder, skills-workflow, pragmatic-programmer, leading-words, ubiquitous-language, strategic-programming
related:
  - wiki/agent-eval/eval-driven-development.md
  - wiki/claude-code/agent-loops.md
  - wiki/graph-engineering/
  - wiki/code-migration/code-migration-methodology.md
-->

## 摘要

Skills For Real Engineers 作者 Matt Pocock 在 96 分钟访谈中展开"如何提升与 AI 协作质量"的方法论：核心不是新发明，而是把《The Pragmatic Programmer》《软件设计的哲学》《领域驱动设计》等 20 多年前经典工程智慧重新用起来——用对术语做引导词、建好反馈回路、保持代码库整洁，因为代码库就是 Agent 的运行环境。工作流上形成 grill me（拷问对齐）→ spec/tickets（拆分会话）→ wayfinder（地图+战争迷雾管超大工程）的三档流水线，配"白天规划、晚上执行"的 AFK 节奏。

---

## 要点

- **知识已死、智慧永存**：战术性编程（局部实现）已被 AI 吃掉，人类守住的是战略性编程（长期结构与架构权衡），价值反而暴涨。
- **15 万 token 聪明区**：无论上下文窗口多大，只有前约 15 万 token 注意力可靠，大工程必须切分成多会话——这是整个流水线存在的前提。
- **grill me**：让 Agent 像资深工程师一样无情追问（认证方案、限流粒度……），先对齐范围与价值排序再动手；单会话能装下时用它。
- **spec → tickets**：把拷问结果沉淀为规格文档，拆成"一个会话一张工单"逐张消化，绕开上下文墙。
- **wayfinder**：超大工程（grill 一轮装不下，如 Stripe 克隆）用决策点有向无环图做地图，每次拷问拨开一片战争迷雾点亮里程碑；工单可分拷问/原型/研究/基建类型。
- **三档决策树**：五行小改动先做后对齐（shift right）；单会话用 grill me；跨多会话用 wayfinder。
- **引导词（Leading Words）**：把 tracer bullet、vertical slice、don't outrun your headlights、programming by coincidence 等经典术语直接写进提示词，模型会在推理痕迹里"说回来"并改变行为——术语是激活训练数据中深层概念的钥匙。
- **统一语言（ubiquitous language）**：与 Agent 共建领域术语（如"幽灵课程""物化级联"），几个词即可表达复杂变更意图，Agent 也能靠 grep 领域词导航代码库。
- **代码库即环境**：Agent 如《记忆碎片》主角般每会话失忆，人类能靠长期记忆硬扛烂代码，Agent 不能；工程师的角色就是"自己 Agent 的平台团队"，团队唯一需要的就是园丁。
- **TDD 重估**：TDD 为工作记忆小的人类设计，Agent 工作记忆大得多所以瞄准错了问题；但 Agent 需要反馈回路且 TDD 让它难以作弊，要的是"给我 TDD 证据（无此改动测试必败）"，并用自动化审查治理同义反复的垃圾测试。
- **技术债加速**：Agent 无法战略性思考，代码库随时间劣化更快，需要实现 Agent + 审查 Agent 双轨制持续对抗软件熵。

---

## 详细内容

### 人物背景

Matt Pocock 做过六年声乐/语音教师，2017 年前后为回乡下生活转行自学开发，第一个作品是 Web Audio 嗓音频谱分析工具。零技术背景反而给了他"向人解释技术"的 unfair advantage，晋升极快，成为 TypeScript 早期布道者，后加入 Stately（XState 作者团队），短暂待过 Vercel（Turbopack 初版文档）。与 Egghead 创始人 Joel Hooks 合作的 Total TypeScript 课程 2023 年初发布后迅速达七位数营收、累计 250 万美元，商业模式干净：无赞助无打赏，只靠产品与企业教育预算。转折点是去年 12 月寒假（Claude Opus 4.5 发布后集体"顿悟"）：Agent 终于好到可以委派，他转向 AI 工作流，其 Skills 仓库已获 23 万 star。

### 流水线全貌

```
grill me（拷问对齐）
  → spec（规格沉淀）→ tickets（一会话一单）→ 实现循环
  → wayfinder（超大工程：DAG 地图 + 战争迷雾 + 多类型工单）
  → 日班/夜班节奏（白天规划、晚上执行、早上看干净代码）
```

grill me 的本质是解决人机沟通鸿沟：Agent 读不懂你的心，不会自动继承你的价值排序。主持人实测"查邮箱是否订阅"的简单 API 被追问 35 个问题。Matt 从原理上归因：人人都有被 grill me 折磨的故事，模型在此框架下出现涌现行为，会主动跳出框框抛想法。wayfinder 则把用途扩到编程之外：规划课程、在自家花园盖办公室。

### 引导词与统一语言

发现 Agent 在生产"软件熵"（代码越改越烂）后，他翻开未拆封的《The Pragmatic Programmer》，发现几乎每行都像为今天写的。把经典概念写进提示词后，模型开始在推理痕迹中使用这些术语——呼应 Kent Beck 三十年前和 Ward Cunningham 抱同义词词典找"最准确的词"的做法：用对词从来不是新发明。DDD 的统一语言进一步把人机对话从"长篇解释"压缩为"几个领域词 + grep 可导航"。

### 代码库即环境的实践含义

- 每天早上跑一个自动循环，用 skill 扫描代码库架构并给出改进提案，一键转工单执行。
- 呼应"园丁"隐喻：静静看 PR 流、拔掉如常春藤蔓延的 lint 抑制；Matt 更激进：团队唯一需要的就是园丁。
- 战略失误的反馈回路很长（9 个月后才炸，如面对巨大调音台推子阵）；AI 让跑得更快、战略错误更快反噬，反而压缩学习周期——但 AI 也能更快修复、伤疤变浅，"学习是否还深刻"是开放问题。

### 其余观点

- **新人**：公司为何雇不具备战略知识的人？Uncle Bob 建议"把新人当 Agent 用一段时间"被批为巨大浪费；给新人的建议是尽情用 Agent 但别把学习外包出去，"只要还在学习，我们就没事"，而 grill me 逼你持续思考。
- **本地开发环境**：正在放弃本地环境，组织需要共享终端、在 Slack/Discord/Linear 里 @ 一个人进入拷问会话；每天和 Agent 开晨会排日程、理解 Discord 消息（Ramp/Stripe/Uber 的云端环境已是一条 Slack 命令，70–80% 开发者自愿转向）。
- **瀑布流**：引 Grady Booch——瀑布流的问题从来不是"先计划再实施"，而是计划一年实施三年、四年后发现做错东西；两周到三个月的迷你瀑布一直是大厂常态。
- **教育**：Agent"教你一切"只部分成立，人们真正需要的是策展——把知识依赖图变成最优线性路径（在知识图谱上跑 Dijkstra），而这正是 AI 不擅长的战略性工作；他从 TypeScript（战术层）到 AI 工作流（战略层）的转型踩中了价值转移。

---

## 来源备注

| 原始文件 | 位置 | 备注 |
|----------|------|------|
| [[raw/264K🌟 Skills 作者 Matt Pocock 96 分钟访谈：grill me 与 wayfinder 工作流，25 年前老书中藏着答案.md\|Matt Pocock 96 分钟访谈]] | raw/ | @shao__meng 访谈纪要，2026-09-17；访谈本体为 Matt Pocock × Gergely Orosz 96 分钟 YouTube 对谈 |
