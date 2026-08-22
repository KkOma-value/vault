# Taxonomy / 知识分类规则

Last updated / 最后更新: 2026-08-22

---

## Purpose / 用途

This file defines how raw source files should be mapped into wiki domains.
这个文件用于规定 raw 原始文件应该如何归类到 wiki 知识领域。

The goal is consistency: prefer updating an existing domain when the file clearly belongs there, and create a new domain only when the existing taxonomy cannot represent the content.
目标是保持分类一致：如果文件明显属于已有领域，优先更新已有领域；只有现有分类无法表达该内容时才创建新领域。

---

## Domain Rules / 领域规则

- Folder names use English lowercase slugs: `retrieval-augmented-generation`, `vector-databases`, `frontend-development`.
- 文件夹名称使用英文小写 slug，单词之间用连字符连接。
- Keep domains flat under `wiki/`; use related-domain links instead of nested folders.
- `wiki/` 下保持扁平领域结构；领域之间通过 related-domain 链接建立关系，而不是嵌套目录。
- Prefer a domain name with 1 to 3 words.
- 领域名称优先控制在 1 到 3 个英文词。
- Use bilingual titles, tags, and summaries inside indexes.
- 索引内部使用中英双语标题、标签和摘要。

---

## Matching Rules / 匹配规则

When processing a new raw file, evaluate these signals in order:
处理新的 raw 文件时，按以下顺序判断归属：

1. Existing domain title, tags, and summary match the file topic.
2. Existing domain `_index.md` already links closely related content.
3. File headings, abstract, keywords, or repeated terms match an existing domain.
4. If two or more strong signals point to one domain, update that domain.
5. If no existing domain has strong signals, create a new domain.

If a file spans multiple domains, choose one primary domain and add cross-links in each related domain index.
如果一个文件横跨多个领域，选择一个主领域，并在相关领域索引中添加交叉链接。

---

## New Domain Checklist / 新领域检查清单

- Create `wiki/<domain>/_index.md` from `wiki/_templates/domain_index_template.md`.
- Add the domain entry to `wiki/_master_index.md`.
- Add the raw file path to the domain Source Files table.
- Add related-domain links when there are close conceptual neighbors.
- Use one content file per topic, created from `wiki/_templates/content_template.md`.

---

## Existing Domains / 现有领域

| Domain | Title/标题 | Scope/范围 | Typical Tags/常见标签 |
|--------|------------|------------|------------------------|
| ai-design | AI 设计 | 用 AI 做 UI/产品设计的方法论：品味、工作流、设计技能、灵感板 | ai-design, ui-design, 品味, 工作流, 设计技能, inspiration-board |
| claude-code | Claude Code | Claude Code 使用原理与配置：模型、努力程度、token 消耗 | claude-code, llm, 模型选择, 努力程度, token |
| pi-agent | Pi 代理框架 | Pi 编码代理框架的原理、扩展系统与 SDK、会话上下文压缩（compaction）机制 | pi, agent-framework, 扩展系统, sdk, coding-agent, compaction, 上下文压缩 |
| ai-self-media | AI 自媒体 | AI 自媒体运营方法论：起号、选题、拍剪、过审、变现 | ai-self-media, 自媒体, 内容创作, 起号, 变现, 流量 |
| graph-engineering | Graph Engineering / 图结构 Agent 编排 | 复杂 Agent 任务的图结构设计：节点拆分、并行、验证关卡、路由、容错、Dynamic Workflows | graph-engineering, agent-orchestration, 多agent, 并行, 验证关卡, 路由, dynamic-workflows |
| code-migration | 代码迁移 / Code Migration | 用 Claude Code + 多 agent 循环做大规模代码迁移：judge 判据、实现—审查—修复循环、对抗式审查、机械化验证 | code-migration, claude-code, 多agent, 对抗式审查, judge, loop |
| ai-automation | AI 自动化 / AI Automation | 把 AI 嵌入工作流、无人值守自动完成重复任务的落地工具与范式：只读+定时、本地脱敏、凭据隔离、双格式产出 | ai-automation, 工作流自动化, 本地优先, 隐私脱敏, 定时任务 |
| ai-industry | AI 行业观察 / AI Industry | AI 行业宏观观察：商业战略、定价与开源逻辑、算力格局、技术路线、组织方式 | ai-industry, deepseek, 商业战略, agi, 算力, 开源, 组织管理 |
| algo-trading | 算法交易 / Algo Trading | 算法/量化交易策略、架构与风控：预测市场做市、套利、信号系统、执行引擎、仓位管理 | algo-trading, quantitative-trading, prediction-market, market-making, polymarket, 量化交易, 做市, 套利 |
| ai-security | AI 安全 / AI Security | AI 驱动的安全攻防：Vibe Coding 产品漏洞扫描与修复，自主 Agent 攻击与防守自动化（事件复盘、群体智慧涌现、应急响应），以及约束 Agent 执行的防守侧——原地进程沙箱（Seatbelt/SRT、文件/网络/环境/npm 隔离） | ai-security, codex-security, vibe-coding, 漏洞扫描, 安全审查, openai, agent-attacks, 自主agent, 群体智慧, 零日, 红队, agent-sandbox, seatbelt, 进程隔离 |
| ai-tools | AI 工具集成 / AI Tools | AI Agent 工具/插件/Skill 的接入方法与公开 API 集成指南 | ai-tools, agent-skills, api, mcp, rss, 工具集成, agent-browser, cdp, cloudflare |
| overseas-access | 海外访问 / Overseas Access | 在中国大陆获取海外手机号、网络访问等基础设施，解决 AI 服务验证门槛 | overseas-access, esim, 美国号, 海外手机卡, beesim, saily |
| indie-dev | 独立开发 / Indie Dev | 独立开发者的产品思维与经营方法论：产品工程师定位、需求克制、高频发布、个人品牌与信任、出海、渠道选择、数据分析 | indie-dev, indie-hacking, 独立开发, 产品思维, 品牌, 出海, 数据分析, 高频发布 |
| multiagent-coordination | 多 Agent 协作 / Multi-Agent Coordination | 多 Agent 协作的基础研究与协调难题：单 agent 等价性、分布式协调不可消除的问题（共识、死锁、状态一致性）、通信协议、专家平均化 | multiagent, coordination, 分布式协作, 协议, 死锁, communication-reasoning-gap, consensus |
| agent-fleet | Agent 舰队 / Agent Fleet | 企业级 AI Agent 舰队的部署、治理与持续优化：agent-as-code、非开发者构建、harvester-tuner 反馈循环、成本效率比、信任阶梯 | agent-fleet, managed-agents, 企业部署, agent-as-code, harvester-tuner, fleet-governance |
| agent-platform | Agent 平台 / Agent Platform | Agent 运行时/线束（harness）作为平台嵌入已有产品的架构模式：会话状态、工具暴露、沙箱、审批流、集成层选择 | agent-platform, agent-harness, codex, sdk, app-server, mcp, 嵌入式agent |
| agent-eval | Agent 评测 / Agent Eval | 用评测（eval）驱动 Agent 技能开发：先写测试再写 skill，量化成功率，hill-climb 迭代，eval 反哺工具改进 | agent-eval, eval-driven-development, agent-skills, firebase, llm-as-judge, 基线, hill-climb |
| dev-toolchain | 开发工具链 / Dev Toolchain | JavaScript/TypeScript 开发工具链的重大版本与技术演进：运行时、打包器、包管理器 | dev-toolchain, javascript, typescript, bun, runtime, bundler, 工具链 |
| agent-cost-optimization | Agent 成本优化 / Agent Cost Optimization | Multi-Agent 工作流的 token 成本治理：先度量后优化，围绕“只加载需要的上下文、剔除无关上下文、消除重复上下文”三原则的工程实践（渐进式披露、稳定前缀、CLI 替代 MCP、代码图谱、工具并行化） | agent-cost, token优化, context-engineering, prompt-cache, progressive-disclosure, cli-over-mcp, graphify, rtk, 并行调用, 多agent成本 |

---

## Status Semantics / 状态语义

- `pending`: registered in `raw/_ingestion_log.md`, not yet organized into wiki.
- `processed`: content has been summarized, placed in wiki, and indexes were updated.
- `skipped`: intentionally not processed; add a short reason in the log or commit message.
