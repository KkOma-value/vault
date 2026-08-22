# 总索引

最后更新: 2026-08-22

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
- **更新**: 2026-08-21
- **文件数**: 3
- **标签**: claude-code, llm, 模型选择, 努力程度, token, loops, 代理循环, startup, 组织实践
- **摘要**: Claude Code 的模型与努力两个设置如何影响输出、成本与行为；循环（loops）的四类模式；以及初创公司五大规则（人人皆可交付、自动化繁琐、信任但验证、为重构而构建、原型-自用-产品化）。
- **来源**: raw/《克劳德密码》中的模型与努力：知道更多还是努力更多.md, raw/Getting started with loops.md, raw/Claude Code 初创公司指南：五大规则与创始人洞见.md

### pi-agent

- **标题**: Pi 代理框架
- **路径**: `wiki/pi-agent/`
- **创建**: 2026-07-09
- **更新**: 2026-08-14
- **文件数**: 2
- **标签**: pi, agent-framework, 扩展系统, sdk, coding-agent, compaction, 上下文压缩
- **摘要**: Pi 编码代理框架的原理、扩展系统与 SDK 用法；默认极简，靠 TypeScript 扩展添加一切能力。长会话中 Pi 用 compaction 突破上下文窗口：独立 LLM 请求把旧历史总结成结构化摘要，默认保留约 2 万 token 近期轮次，纯文本存储跨模型可移植，代价是打破 prompt cache。
- **来源**: raw/Pi 代理 101 - 如何扩展和构建自己的线束.md, raw/How Compaction Works in Pi.md

### ai-self-media

- **标题**: AI 自媒体
- **路径**: `wiki/ai-self-media/`
- **创建**: 2026-07-21
- **更新**: 2026-08-21
- **文件数**: 3
- **标签**: ai-self-media, 自媒体, 内容创作, 起号, 变现, 流量, x, 原创内容, ai-video, faceless
- **摘要**: AI 自媒体运营完整框架：起号、选题、拍剪、过审、变现路径；X 原创内容奖励计划规则；以及用 Claude Skill + KIE.ai 零月费生成无脸 AI 视频的产品营销引擎（$0.75/条）。
- **来源**: raw/写给AI 自媒体小白的第一篇教程：《从0 开始做一名AI 博主 》.md, raw/Original Content 奖励计划.md, raw/This 1 Claude Skill fully replaces your Higgsfield subscription (FULL BREAKDOWN).md

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
- **更新**: 2026-08-09
- **文件数**: 3
- **标签**: ai-security, codex-security, vibe-coding, 漏洞扫描, 安全审查, openai, agent-attacks, 自主agent, 群体智慧, 零日, 红队, 应急响应, agent-sandbox, seatbelt, 进程隔离
- **摘要**: AI 驱动的安全攻防：Vibe Coding 产品漏洞扫描工具，自主 Agent 攻击事件复盘——评测 Agent 无人类指挥链式利用零日入侵 OpenAI 内网与 Hugging Face，群体智慧涌现与防守自动化建议；以及防守侧对偶——用原地 OS 进程沙箱（Seatbelt/SRT）把 AI 代理的执行约束在可控边界内（文件、网络、环境、npm 隔离）。
- **来源**: raw/OpenAI开源的这个安全插件，是每个Vibe Coding的人都必装的神器。.md, raw/OpenAI 复盘 GPT 入侵 Hugging Face 事件：AI 出现了群体智慧涌现 互相交流技术、隐藏踪迹、清查内鬼 · 小互 · AI 解读站.md, （代码库）long-agent/src/long/sandbox/

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

### indie-dev

- **标题**: 独立开发 / Indie Dev
- **路径**: `wiki/indie-dev/`
- **创建**: 2026-08-14
- **更新**: 2026-08-14
- **文件数**: 1
- **标签**: indie-dev, indie-hacking, 独立开发, 产品思维, product-engineering, 品牌, 出海, 数据分析, 高频发布
- **摘要**: 独立开发者的产品思维与经营方法论：产品工程师定位（代码只占 30%）、需求克制、每周高频发布、个人品牌与信任经营、出海与真诚、X 脉冲 vs YouTube 长尾的渠道选择、数据分析驱动迭代。首篇为 Tw93 复盘 Mole 从开源 CLI 到 Mac 付费软件的过程。
- **来源**: raw/Post by @HiTw93 on X.md

### multiagent-coordination

- **标题**: 多 Agent 协作 / Multi-Agent Coordination
- **路径**: `wiki/multiagent-coordination/`
- **创建**: 2026-08-18
- **更新**: 2026-08-18
- **文件数**: 1
- **标签**: multiagent, coordination, 分布式协作, 协议, 死锁, communication-reasoning-gap, 信息孤岛, consensus
- **摘要**: 多 Agent 协作的基础研究与协调难题：何时需要多 agent（单 agent 等价性）、分布式协调不可消除的问题（共识、死锁、状态一致性、专家平均化）、自然语言通信的局限、必须引入分布式系统级协议。
- **来源**: raw/multiagent 协作问题的初步整理.md

### agent-fleet

- **标题**: Agent 舰队 / Agent Fleet
- **路径**: `wiki/agent-fleet/`
- **创建**: 2026-08-18
- **更新**: 2026-08-18
- **文件数**: 1
- **标签**: agent-fleet, managed-agents, 企业部署, agent-as-code, 反馈循环, harvester-tuner, 成本追踪, fleet-governance
- **摘要**: 企业级 AI Agent 舰队的部署、治理与持续优化：agent-as-code（git 管全部）、非开发者构建生产 agent、harvester-tuner 三角色反馈循环、价值/成本效率比追踪、从推荐到自动化的信任阶梯。首篇为 ABC Legal 1100 人公司 50+ agent 舰队案例。
- **来源**: raw/How ABC Legal turned every employee into a builder with Claude Managed Agents.md

### agent-platform

- **标题**: Agent 平台 / Agent Platform
- **路径**: `wiki/agent-platform/`
- **创建**: 2026-08-21
- **更新**: 2026-08-22
- **文件数**: 2
- **标签**: agent-platform, agent-harness, codex, sdk, app-server, mcp, 嵌入式agent
- **摘要**: Agent 运行时/线束（harness）作为平台的架构模式：将 agent 循环嵌入已有产品而非让用户搬到通用聊天框；OpenAI Codex 开源 harness 的三层集成（exec/SDK/app-server）与应用所有权分层，以及 harness 四要素（系统提示词/工具/agentic loop/翻译层）概念基础。
- **来源**: raw/Codex as a platform build on the open agent harness.md, raw/What is a Harness?.md

### agent-cost-optimization

- **标题**: Agent 成本优化 / Agent Cost Optimization
- **路径**: `wiki/agent-cost-optimization/`
- **创建**: 2026-08-22
- **更新**: 2026-08-22
- **文件数**: 1
- **标签**: agent-cost, token优化, context-engineering, prompt-cache, progressive-disclosure, cli-over-mcp, graphify, rtk, 并行调用, 多agent成本
- **摘要**: Multi-Agent 工作流的 token 成本治理：先度量后优化，围绕“只加载需要的上下文、剔除无关上下文、消除重复上下文”三原则的工程实践——渐进式披露、稳定前缀、CLI 替代 MCP、代码图谱、工具并行化等，实测端到端 token -55.5%、全流程预估降本 50%~65%。
- **来源**: raw/靠这10个优化点，我们把Multi-Agent工作流成本降了50%以上.md

### agent-eval

- **标题**: Agent 评测 / Agent Eval
- **路径**: `wiki/agent-eval/`
- **创建**: 2026-08-21
- **更新**: 2026-08-21
- **文件数**: 1
- **标签**: agent-eval, eval-driven-development, agent-skills, firebase, llm-as-judge, 基线, hill-climb
- **摘要**: 用评测（eval）驱动 Agent 技能开发的方法论：先写测试再写 skill，量化 agent 成功率并迭代优化。Firebase 实测 skill 使通过率从 31.7% → 78%，input tokens 降 40%。
- **来源**: raw/Eval-driven development.md

### dev-toolchain

- **标题**: 开发工具链 / Dev Toolchain
- **路径**: `wiki/dev-toolchain/`
- **创建**: 2026-08-21
- **更新**: 2026-08-21
- **文件数**: 1
- **标签**: dev-toolchain, javascript, typescript, bun, runtime, bundler, 工具链
- **摘要**: JavaScript/TypeScript 开发工具链的重大版本与技术演进。首篇为 Bun 1.4：Zig→Rust 重写、Node.js 兼容 +1517 测试、内置 WebView/Image/cron API、并行 run/test、全局虚拟存储 7× 安装加速。
- **来源**: raw/Bun 1.4.md
