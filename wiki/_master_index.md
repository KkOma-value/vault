# 总索引

最后更新: 2026-08-08

---

<!--
条目格式:
每个领域条目遵循以下结构：

### [folder-name]

- **标题**:
- **路径**: `wiki/folder-name/`
- **创建**: YYYY-MM-DD
- **更新**: YYYY-MM-DD
- **文件数**: N
- **标签**: tag-a, tag-b
- **摘要**: 一句中文概述。
- **来源**: 对应 raw 文件路径列表。

新增领域时：
1. 在 wiki/ 下创建文件夹
2. 用 wiki/_templates/domain_index_template.md 创建 _index.md
3. 在此处添加条目
4. 更新相关领域的交叉链接

更新领域时：
1. 更新内容文件
2. 更新领域 _index.md
3. 更新此处的更新日期和文件数
4. 如有新来源，补充来源路径
-->

## 知识领域

分类规则：[知识分类规则](./_taxonomy.md)

---

### ai-design

- **标题**: AI 设计
- **路径**: `wiki/ai-design/`
- **创建**: 2026-07-15
- **更新**: 2026-07-15
- **文件数**: 1
- **标签**: ai-design, ui-design, 品味, 工作流, 设计技能, inspiration-board
- **摘要**: 用 AI 做 UI/产品设计的方法论——人给方向与品味、AI 负责执行；含设计技能、逐组件、灵感板三种路径与 10 步工作流。
- **来源**: raw/How To Actually Design With AI.md

### claude-code

- **标题**: Claude Code
- **路径**: `wiki/claude-code/`
- **创建**: 2026-07-09
- **更新**: 2026-07-14
- **文件数**: 2
- **标签**: claude-code, llm, 模型选择, 努力程度, token, loops, 代理循环
- **摘要**: Claude Code 的模型与努力两个设置如何影响输出、成本与行为；以及用循环（loops）让代理重复执行工作周期直到满足停止条件（回合制/目标驱动/时间驱动/主动式四类）。
- **来源**: raw/《克劳德密码》中的模型与努力：知道更多还是努力更多.md, raw/Getting started with loops.md

### pi-agent

- **标题**: Pi 代理框架
- **路径**: `wiki/pi-agent/`
- **创建**: 2026-07-09
- **更新**: 2026-07-09
- **文件数**: 1
- **标签**: pi, agent-framework, 扩展系统, sdk, coding-agent
- **摘要**: Pi 编码代理框架的原理、扩展系统与 SDK 用法；默认极简，靠 TypeScript 扩展添加一切能力。
- **来源**: raw/Pi 代理 101 - 如何扩展和构建自己的线束.md

### ai-self-media

- **标题**: AI 自媒体
- **路径**: `wiki/ai-self-media/`
- **创建**: 2026-07-21
- **更新**: 2026-08-08
- **文件数**: 2
- **标签**: ai-self-media, 自媒体, 内容创作, 起号, 变现, 流量, x, 原创内容
- **摘要**: AI 自媒体运营完整框架：为什么做（AI 厂商砸钱推广、小 KOC 收入数倍于其他赛道）、怎么起号、内容选题（技术派 vs 泛流量派）、拍剪、国内平台过审策略、三种变现路径；以及 X 平台原创内容奖励计划的变现规则（有效曝光计费、准入门槛、原创判定）。
- **来源**: raw/写给AI 自媒体小白的第一篇教程：《从0 开始做一名AI 博主 》.md, raw/Original Content 奖励计划.md

### graph-engineering

- **标题**: Graph Engineering / 图结构 Agent 编排
- **路径**: `wiki/graph-engineering/`
- **创建**: 2026-07-21
- **更新**: 2026-07-26
- **文件数**: 2
- **标签**: graph-engineering, agent-orchestration, 多agent, 并行, 验证关卡, 路由, dynamic-workflows
- **摘要**: 把复杂 Agent 任务从线性流水线重构为图结构：节点拆分、并行分支、验证关卡、条件路由、局部容错，以及 Claude Code Dynamic Workflows 的实践映射。
- **来源**: raw/彻底告别Loop Engineering：一文读懂 Graph Engineering.md, raw/Graph Engineering with Claude 14-Step roadmap from 0 to graph architect (Full Course).md

### code-migration

- **标题**: 代码迁移 / Code Migration
- **路径**: `wiki/code-migration/`
- **创建**: 2026-07-24
- **更新**: 2026-07-24
- **文件数**: 1
- **标签**: code-migration, claude-code, 多agent, 对抗式审查, judge, loop, dynamic-workflows
- **摘要**: 用 Claude Code + 多 agent 循环做大规模代码迁移的方法论：先建可信 judge，再跑"实现—审查—修复"循环，让对抗式审查负责判断、机械化脚本负责验证，核心是修流程而非修代码。
- **来源**: raw/How Anthropic runs large-scale code migrations with Claude Code.md

### ai-automation

- **标题**: AI 自动化 / AI Automation
- **路径**: `wiki/ai-automation/`
- **创建**: 2026-07-24
- **更新**: 2026-07-24
- **文件数**: 1
- **标签**: ai-automation, 工作流自动化, 本地优先, 隐私脱敏, 定时任务, 落地工具
- **摘要**: 把 AI 嵌入现有工作流、每天自动完成一件重复性工作的落地自动化工具与范式：只读+定时触发、本地脱敏、凭据隔离、机器/人双格式产出。
- **来源**: raw/微信群日报工具：每天晚上10点，自动把群聊变成一页PDF.md

### ai-industry

- **标题**: AI 行业观察 / AI Industry
- **路径**: `wiki/ai-industry/`
- **创建**: 2026-07-24
- **更新**: 2026-07-24
- **文件数**: 1
- **标签**: ai-industry, deepseek, 商业战略, agi, 算力, 开源, 组织管理
- **摘要**: AI 行业的战略、商业模式、算力格局、组织方式等宏观观察；收录一线创始人/机构的关键判断与其背后的推理逻辑。首篇为 DeepSeek 梁文锋交流会要点。
- **来源**: raw/Deepseek 梁文锋投资者交流会录音讲了什么.md

### algo-trading

- **标题**: 算法交易 / Algo Trading
- **路径**: `wiki/algo-trading/`
- **创建**: 2026-07-26
- **更新**: 2026-07-26
- **文件数**: 1
- **标签**: algo-trading, quantitative-trading, prediction-market, market-making, polymarket, 量化交易, 做市, 套利
- **摘要**: 算法/量化交易的策略、架构与风控：预测市场做市、套利、信号系统、执行引擎、仓位管理、回测验证。
- **来源**: raw/我分析了 100 多个每月收入 5 万美元的 Polymarket 机器人。以下是它们如何从 500 万1500 万加密货币市场中获利。.md

### ai-security

- **标题**: AI 安全 / AI Security
- **路径**: `wiki/ai-security/`
- **创建**: 2026-08-06
- **更新**: 2026-08-08
- **文件数**: 2
- **标签**: ai-security, codex-security, vibe-coding, 漏洞扫描, 安全审查, openai, agent-attacks, 自主agent, 群体智慧, 零日, 红队, 应急响应
- **摘要**: AI 驱动的安全攻防：Vibe Coding 产品漏洞扫描工具，以及自主 Agent 攻击事件复盘——评测 Agent 无人类指挥链式利用零日入侵 OpenAI 内网与 Hugging Face，群体智慧涌现与防守自动化建议。
- **来源**: raw/OpenAI开源的这个安全插件，是每个Vibe Coding的人都必装的神器。.md, raw/OpenAI 复盘 GPT 入侵 Hugging Face 事件：AI 出现了群体智慧涌现 互相交流技术、隐藏踪迹、清查内鬼 · 小互 · AI 解读站.md

### ai-tools

- **标题**: AI 工具集成 / AI Tools
- **路径**: `wiki/ai-tools/`
- **创建**: 2026-08-06
- **更新**: 2026-08-07
- **文件数**: 2
- **标签**: ai-tools, agent-skills, api, mcp, rss, 工具集成, kitesurf, cloudflare, agent-browser, cdp
- **摘要**: AI Agent 工具/插件/Skill 的接入方法与公开 API 集成指南。含 AI HOT Agent Skill 接入、Cloudflare Kitesurf Agent 浏览器。
- **来源**: raw/Agent 接入.md, raw/Introducing Kitesurf The agent-first browser that runs in V8 isolates on Cloudflare Workers.md

### overseas-access

- **标题**: 海外访问 / Overseas Access
- **路径**: `wiki/overseas-access/`
- **创建**: 2026-08-06
- **更新**: 2026-08-06
- **文件数**: 1
- **标签**: overseas-access, esim, 美国号, 海外手机卡, beesim, saily
- **摘要**: 在中国大陆获取海外手机号等基础设施，解决 AI 服务注册验证门槛。首篇为 BeeSIM + Saily 最低成本美国号方案。
- **来源**: raw/国行手机用上 eSIM + 最便宜的美国号，保姆级教程手把手带你搞定.md
