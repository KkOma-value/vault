# 什么是 Agent Harness（线束）

<!--
内容元数据:
source_raw_files:
  - raw/What is a Harness?.md
domain: agent-platform
created: 2026-08-22
updated: 2026-08-22
tags: agent-harness, system-prompt, tools, agentic-loop, translation-layer, open-source, 用户主权
related:
  - wiki/pi-agent/_index.md
  - wiki/agent-platform/codex-as-platform.md

链接格式规则（Obsidian 可点击）:
- 正文中引用其他知识文件使用 [[domain/topic-file]] 或 [[domain/topic-file|显示标题]]
- 来源备注表中"原始文件"列使用 [[raw/path/file|显示名]] 格式
- 禁止使用反引号包裹路径（Obsidian 不会渲染为可点击链接）
-->

## 摘要

Agent Harness（线束）是为 AI 模型提供运行环境的软件，即 Agent = Model + Harness 中的 Harness。文章以登山安全带作类比：harness 承托和保护用户、可挂载工具、可随场景改装且归用户所有。任何 harness 通常做四件事：提供系统提示词（System Prompt）、提供工具集（Tools）、建立 agentic loop 行为框架、以及实现对接多种模型的翻译层（Translation Layer）。核心主张：与 AI 模型不同，用户可以拥有并改造自己的 harness——开源中立 harness（Pi、OpenClaw、OpenCode 等）把控制权从 AI 实验室交还给终端用户。

---

## 要点

- **定义**：agent harness 是为 AI 模型提供运行环境的软件；首个应用场景是编码，现已处于各类 AI agent 的核心。
- **四要素**：
  1. **System Prompt**——类似新员工第一天的入职须知，随每轮对话注入，约束模型在该 harness 环境中的行为；
  2. **Tools**——用代码写成的可调用能力（搜索、写码、发邮件等），harness 只描述和提供工具，由模型自己决定何时及如何调用；
  3. **Agentic Loop**——模型自主评估结果、决定再次调用工具或结束任务的行为框架，循环闭合即任务完成；
  4. **Translation Layer**——让同一 harness 对接不同厂商模型，甚至在同一 loop 中混用不同模型。
- **翻译层的战略意义**：它把权力从 AI 实验室转移给终端用户——用户可在本地运行自己的 harness，自由选择 Anthropic/OpenAI/开源权重模型，对比结果与成本（按 cost-per-task 衡量），并把会话记录保留在本地。
- **可拥有性**：模型本身无法拥有，但 harness 可以。Pi 是极简 harness 的代表：系统提示词短、工具少、开箱即用不碍事，用户通过编写 extension 改造工作流并互相分享（已超过 5000 个）。
- **历史脉络**：首个流行 harness Claude Code 并非中立翻译层，而是绑定 Claude 模型的编码应用；此后 OpenClaw、OpenCode、Hermes、Pi 等免费开源 harness 兴起，走向中立化。

---

## 详细内容

### 类比：登山安全带

Harness 一词本义是登山/攀岩用的安全带系统：承托身体、连接绳索防坠落、可挂载镁粉袋等额外工具；换一座山可以带着同一副 harness 并按地形调整装备环。作者用这个类比强调 agent harness 的三个同构特征——保护与支撑、可挂载工具、**可改装且归个人所有**。

### 四个组成部分详解

1. **System Prompt**：与训练期固化的模型内在规则（如 Claude 的"soul document"）不同，system prompt 更像外部注入的行为准则，随每次请求进入上下文，保证模型在特定 harness 场景下举止得当。
2. **Tools**：关键设计原则是 harness 不替模型决策。harness 清晰描述工具并交付执行软件，何时调用、如何组合由模型的自主判断完成——这是 agent 与传统自动化脚本的分界。
3. **Agentic Loop**：文中给出一个完整例子——用户邮件要求比较本地小学排名与分数并给建议。模型先理解请求，构造搜索查询；评估结果不足时**自行决定再搜一轮**（loop 的第一个体现）；再用 WriteCode 工具生成电子表格做计算与格式化；对照原始请求检查是否满意，不满意则回到搜索；最后调用 ComposeEmail 汇总成邮件并附表格，审阅后闭环。整个过程数秒内完成。
4. **Translation Layer**：除多模型兼容外，其深层价值在于用户主权——同一个请求可以分别发给不同厂商的模型，比较质量与成本，答案集中保留在一处而非分散在三个 App 里。

### 把 Harness 变成自己的

Pi 被引为极简 harness 典范：设计哲学是"开箱即用地让路"，用户随后按自身工作流改造 system prompt、开发 extension 并分享（社区已有 5000+ extensions）。Pi 免费开源、运行在用户自己的笔记本上。

### 开源中立 Harness 与人的能动性（agency）

作者立场：面对日益集中的 AI 公司权力，中立开源 harness 是强化人类能动性的路径——用户保留工具的自由改装权与本地会话记录权。"我们握锤子，而不是锤子握我们。"

---

## 来源备注

| 原始文件 | 位置 | 备注 |
|----------|------|------|
| [[raw/What is a Harness?\|What is a Harness?]] | raw/ | Earendil Product 博客，2026-08-20 |
