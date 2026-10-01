# 机器原生智能（Machine Native Intelligence）

<!--
内容元数据:
source_raw_files:
  - raw/AI primer.md
domain: machine-native-intelligence
created: 2026-09-22
updated: 2026-09-22
tags: machine-native-intelligence, decision-models, calibration, rlcd, rlhf, mode-dropping
related:
  - wiki/machine-native-intelligence/system-one-models.md
-->

## 摘要

TypeSafe 提出「机器原生智能」（Machine Native Intelligence）：当大规模自动化主要由 AI 与 AI、AI 与软件之间的交互驱动时，模型输出应像软件一样具备结构、可靠、可观测、可测试、快速、一致、低成本等属性，而不是追求"读起来舒服"的文本。

---

## 要点

- 机器接口比聊天界面更重要：未来自动化中约 99% 是机器对机器交互、约 1% 才是人机交互。
- TypeSafe 不造"什么都能做"的通用模型，只做生产系统里代码能检查和执行的"窄决策"。
- 后训练路径中，除 RLHF、RLVR 之外，TypeSafe 走第三条路 RLCD，优化对象是决策与概率，而非文本。
- 校准（calibration）让不确定性可被软件使用：被赋予 0.8 概率的结果，应约 80% 的时间发生（描述一组预测，而非单个答案）。
- RLHF 适合聊天，但会奖励谄媚与"自信的幻觉"，并导致模式遗忘（mode dropping）：分布收窄，部分输出概率被压低。

---

## 详细内容

### 从"对话"到"机器原生"

多数 AI 产品围绕"模型与人对话"构建，而 TypeSafe 的假设是：大规模自动化将以 AI 与 AI、AI 与软件的交互为主。这会把设计目标从"让人读起来舒服的回答"，转向"在软件内部行为可预测的输出"。

它把这类具备软件属性——结构（structure）、可靠（reliability）、可观测（observability）、可测试（testability）、速度（speed）、一致性（consistency）、低成本（low cost）——的 AI 称为**机器原生智能**。

### 只做生产可用的"窄决策"

TypeSafe 的目标不是"造一个全能的模型"，而是服务生产系统中代码需要的那类**窄而可检查**的决策。它预期自动化中约 99% 是机器对机器交互、约 1% 才是人机交互。设计目标因此从"回答读起来好"转向"输出在软件里表现可预测"。

### 三条后训练路径：RLHF、RLVR 与 RLCD

预训练语言模型此前主要被两条路径改造，TypeSafe 增加了第三条 RLCD：

- **RLHF**（人类反馈强化学习）：以人类偏好为目标训练，曾用于 InstructGPT 与 ChatGPT，由 TypeSafe 联合创始人 Diogo Almeida 参与提出。
- **RLVR**（可验证奖励强化学习）：以可验证的奖励信号进行训练。
- **RLCD**：TypeSafe 的决策模型训练路径，不生成文本，而是返回决策与概率。

### 校准：让不确定性可被软件使用

RLCD 优化的是不同的输出契约：模型不生成文本，而是返回决策与概率；且"概率更高"应意味着"更可能是正确答案"。校准让软件能直接依赖概率——对一组预测而言：

- 概率为 `0.2` 的结果应约 20% 的时间发生；
- 概率为 `0.8` 的结果应约 80% 的时间发生；
- 概率为 `1.0` 的结果应约 100% 的时间发生。

这些比例描述的是一组预测，而不是对任何单个答案的保证。软件需要据此决定"何时行动、何时升级给人工"。

### RLHF 的两类问题

RLHF 让模型说人喜欢听的话，这对聊天机器人有效，但也会奖励**谄媚**和**听起来自信的幻觉**。偏好优化还会导致**模式遗忘（mode dropping）**：模型学会偏爱某种风格（如指令遵循），同时压低其他可能输出的概率。它是 GAN 中"模式崩塌（mode collapse）"的温和版本——生成器反复产出同一类输出来骗过判别器。

核心结论：**人类偏好与机器可信度是两个不同的优化目标**。RLHF 仍适合对话模型，但生产自动化需要以受约束的决策和校准的不确定性为核心的不同训练目标。

---

## 来源备注

| 原始文件 | 位置 | 备注 |
|----------|------|------|
| [[raw/AI primer.md\|AI primer]] | raw/ | TypeSafe 机器学习入门，讲解机器原生智能、RLCD 与校准 |
