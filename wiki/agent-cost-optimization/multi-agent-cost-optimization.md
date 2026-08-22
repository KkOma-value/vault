# Multi-Agent 工作流成本优化：三原则十方向

<!--
内容元数据:
source_raw_files:
  - raw/靠这10个优化点，我们把Multi-Agent工作流成本降了50%以上.md
domain: agent-cost-optimization
created: 2026-08-22
updated: 2026-08-22
tags: agent-cost, token优化, context-engineering, prompt-cache, progressive-disclosure, cli-over-mcp, graphify, rtk, 并行调用, 多agent成本
related:
  - wiki/graph-engineering/graph-engineering-overview.md
  - wiki/agent-platform/what-is-a-harness.md

链接格式规则（Obsidian 可点击）:
- 正文中引用其他知识文件使用 [[domain/topic-file]] 或 [[domain/topic-file|显示标题]]
- 来源备注表中"原始文件"列使用 [[raw/path/file|显示名]] 格式
- 禁止使用反引号包裹路径（Obsidian 不会渲染为可点击链接）
-->

## 摘要

腾讯技术工程团队用 AI Agent 驱动前后端全流程开发（tech-leader Skill，1 个 TL + 6 个子 Agent、5-6 个 Wave），跑起来后发现 token 成本烧得快且不知道烧在哪。先用 AgentLens 按 Wave/会话粒度拆账，定位系统提示词、工具返回信息、历史消息三大消耗来源；再围绕"只看到当前需要的上下文、减少无关上下文、减少重复上下文"三个原则，实施渐进式披露、稳定前缀、CLI 替代 MCP、代码图谱、长期记忆按需索引、工具调用并行化等 10 个方向改造。实测主 Agent 端到端 token -55.5%（轮次 -47%），测试/视觉子 Agent 模型成本 -64%，全流程预估降本 50%~65%。

---

## 要点

- **先度量再优化**：成本分布不清是最大障碍。六类 token 消耗来源：①系统提示词（每轮必带、随 Agent/MCP 数倍增）②工具返回信息（体积不可控、进 context 后反复计费）③读取的文件信息（盲搜式探索 3-5 轮定位）④长期记忆（加载即常驻）⑤历史消息（真正大头、append-only 滚雪球）⑥用户提示词（最便宜、只出现一次）。
- **架构前置判断：是否拆多 Agent**：拆分本身有成本（多份系统提示词并行计费），按 S/M/L 规模预判，小需求单 Agent 直做，中大型才进多 Agent 并行调度。
- **三原则**：①让 AI 只看到当前需要的上下文（按需加载）②减少无关的上下文（一开始就别带进来）③减少重复的上下文（同一内容不要多轮反复计费）。
- **KV Cache 与稳定前缀**：前缀完全一致时服务商复用 KV 矩阵、按约 10% 低价收费；稳定指令与动态内容交错会破坏前缀缓存，需把动态内容统一后置、进度状态外化到文件。
- **最省钱的调用是不调用**：确定性操作用 CLI 脚本执行、数据获取子 Agent 化、用代码图谱替代关键词盲搜，把 LLM 留给真正需要语义理解的地方。
- **能并行就不要串行**：无数据依赖的多次调用合并到同一轮消息内并行发起，省下的是历史被重复打包的轮次。

---

## 详细内容

### 背景：tech-leader 工作流

```
TL（调度层）
├── Wave 1（并行）：后端 Agent + 前端 Agent
├── Wave 2：质量审查 Agent
├── Wave 3：测试 Agent（用例生成 + 执行）
├── Wave 4：视觉验证 Agent
└── Wave 5：Agent 评测
```

跑一次中等需求需 5-6 个 Wave、20+ 次子 Agent 调用、数百轮工具调用。IDE 为 CodeBuddy 内网版，每轮对话工具链与 token 用量上报 AgentLens，通过 agentlens-mcp 按 TraceId 追踪单次调用链路、按 SessionId 聚合完整需求消耗分布。

### 原则一：只看到当前需要的上下文

**1. 渐进式披露（Progressive Disclosure）**

Anthropic Agent Skill 规范的架构思想：不是所有内容都常驻 context，只有真正需要时才加载。SKILL.md 只保留骨架（核心职责、规模预判、分流规则、进度追踪、容错），正文条件性内容与步骤详情外移到 references/ 资源层按需 read_file。好处：即使装 20 个 Skill，初始加载仅 1000-2000 token，上下文使用量 -90%。实测：自动化测试 Skill 正文 198→128 行（-35%）；TL 的 S/M 模式完整流程、Wave 1~5 派发 prompt 全部外移，任一时刻只加载当前阶段所需片段。

**2. 确定性操作由脚本执行（CLI 优先）**

- **dev-env.sh**：数据库迁移、编译、服务启动、健康检查等确定性命令统一脚本化，AI 只提供参数不拼接命令，消除反复查找参数/命令的 token 消耗。
- **CLI 替代 MCP**：每次 MCP 调用 = 一次完整 LLM 推理轮次（决策 + 10-15KB Schema 常驻 + 返回结果进 context + 处理结果）。Playwright MCP → Playwright CLI：LLM 只负责把自然语言用例翻译成 spec 文件，脚本批量执行；操作不再逐按钮消耗推理、失败可重跑、多 spec 可并行。原则：大模型做推理，脚本做执行。

**3. MCP 数据获取子 Agent 化**

TAPD/Figma 原始 payload（需求描述、节点树 JSON、截图 base64）若由 TL 直接调用 MCP，会永久卡在生命周期最长的 Agent context 里后续几十轮重复计费。改为各建一个专属子 Agent，只返回结构化摘要。实测单轮 input token 1,030,000 → 634,905（-38.4%），首轮消耗相近，收益在后继轮次不滚雪球。

**4. 长期记忆按需索引加载**

context-keeper Skill 原先把匹配的历史文档全量读入。改为引入轻量 INDEX.md（几十行标题+标签+摘要表格），先查目录 → 关键词匹配 + 类别权重算相关度 → 取 Top 3 读正文 → INDEX 不存在才回退全文 search_content。相关度低于阈值的文档从一开始就不进 read_file 候选。

### 原则二：减少无关的上下文

**5. 单 Agent 拆分为多 Agent**

单体 Agent 的痛点：前后端/测试/视觉规范混在同一段历史越跑越臃肿、全程无重置时机。改为 TL 专职调度 + 按角色拆分的子 Agent（backend-dev / frontend-dev / test-runner / visual-reviewer / code-reviewer），每个子 Agent 只带本领域提示词与工具，跑完即销毁，Wave 1 可并行。**注意**：拆分本身不直接省钱（6 个 Agent = 6 份系统提示词并行计费），真正收益是切断滚雪球效应和为后续优化打开空间——这也解释了为何必须先做规模预判。

**6. Agent 专属配置（工具白名单 + 模型分层）**

CodeBuddy TeamCreate 自动派生子 Agent 无法设置 MCP 白名单/模型。改为为每个角色创建自定义 Agent，在 frontmatter 的 tools 字段指定工具白名单，未列出工具完全不可见（如 backend-dev 只需读写文件、执行命令，不暴露任何 MCP）。顺带收益：主 Agent 派发提示词中稳定指令迁移到子 Agent 系统提示词（更易命中缓存），派发提示词从 10-15 行精简到 2 行动态内容。模型分层：自动化测试、视觉还原对比等规则性强、推理要求低但轮次最多的角色换 GLM-5v（成本约 Sonnet 36%），测试/视觉 Agent 成本 -64%。

**7. 代码图谱替代盲搜**

关键词盲搜每次返回匹配行都进 context，且需多轮探索定位。graphify 代码图谱用 AST+语义为项目建文件索引与依赖关系，先搜图谱锁定文件范围再 read_file，总 token -22.7%（87.5 万→67.7 万），输入 token -22.8%，缓存命中量 -25.6%（探索轮次减少连带减少了整窗打包计费）。使用：`uv tool install graphify` 初始化（提交 graphify 目录中 4 个文件即可），`graphify hook install` 绑定 post-commit/post-checkout 增量更新，使用方式为直接指示 AI"代码搜索请使用代码图谱 graphify"。

### 原则三：减少重复的上下文

**8. 稳定前缀设计（状态外化）**

KV Cache 机制：LLM 对每个 token 的注意力计算产生 K/V 矩阵，计算量 O(n²)；若本次请求前缀与上次完全一致，服务商直接复用 KV 矩阵，只收缓存读取低价（约 10%）。两个破坏点：
- 派发提示词中稳定指令与动态内容（技术方案文档）交错 → 动态内容统一后置；
- 主 Agent 每阶段在会话里输出完整进度看板 → 进度状态外化到文件，唤醒时 read_file 进度文件而非回放历史，阶段切换改单行输出（✅ Wave 1 完成 → Wave 2 🔄 已启动）。额外收益：会话中断可读文件恢复现场。

**9. 避免重复加载 Skill**

排查前端 Agent context 膨胀发现：主 Agent 方案设计时已加载历史经验并写入技术方案文档，前端 Agent 直接读文档即可拿到结论，无需重新 use_skill 把 200 行 SKILL.md 再次加载。原则：信息在最上游收集一次，通过文档传递给下游，不让每个 Agent 各自重复获取。

**10. rtk 压缩 CLI 输出 + 工具调用并行化**

- **rtk**：命令执行前拦截、把原始输出重写为压缩版本的开源 CLI 代理（官方实测 60-90% 降幅）。接入坑：① 官方 --agent 不支持 CodeBuddy，改用 PreToolUse Hook 自实现；② rtk 输出字段是 updatedInput、CodeBuddy 要求 modifiedInput，字段名不一致会静默失效，需几行转换脚本。评估方法论坑：不能拿"同一需求跑两遍"对比（大模型执行路径不确定、噪声大于效果），用 rtk gain 统计或命令行直接对比（纯文本过滤、100% 可复现）。幅度因命令而异：ps aux -98.9%、纯 git status 仅 -31%。全局配置一次 ~/.codebuddy/settings.json 所有子 Agent 生效。
- **并行化**：无依赖的串行调用每轮都重新打包前面所有历史。TAPD/Figma 摘要获取改为同一轮消息内并行发起（Task 工具同时传入两个 subagent_name）；Playwright CLI 一次接收多 spec、多 worker 并行。判断原则：两次调用之间无数据依赖（后一次不需要前一次输出作为输入）就该并行——"沉默的串行"常藏在最初写 prompt 的顺序思维里。

### 效果数据

| 维度 | 优化前 | 优化后 | 降幅 |
| --- | --- | --- | --- |
| 主 Agent 端到端 token | 708,783（17 轮） | 315,266（9 轮） | -55.5%，轮次 -47% |
| 子 Agent 单轮固定开销 | 常见上几十万 token | 减少约 20,000 token | 视配置 |
| 子 Agent 命令行输出 | 原始 CLI 输出 | rtk 压缩后 | -60%~90% |
| 测试/视觉子 Agent 模型成本 | claude Sonnet 计价 | GLM-5v 计价 | -64% |

### 落地优先级

1. 先做规模预判与 Agent 拆分（架构前提）；
2. 度量 + SKILL.md 重排 + 全局接入 rtk（一个下午见效）；
3. 条件内容移出 SKILL.md、状态外化、无依赖调用改并行（逐步推进）；
4. 代码图谱、CLI 替代 MCP、工具裁剪、子 Agent 化、长期记忆索引化（中长期系统性梳理）。

### 核心经验

1. 省 token 不等于功能降级——只调整"何时加载、怎么表达"，没删任何功能。
2. 上游收集一次，通过文档传递——最贵的冗余是每个 Agent 各自重新发现同一份信息。
3. 最省钱的调用是不调用——确定性操作用 CLI/数据预取解决，LLM 留给语义理解。
4. 能并行就不要串行——省的是历史被重复打包的轮次，而不只是等待时间。

---

## 来源备注

| 原始文件 | 位置 | 备注 |
|----------|------|------|
| [[raw/靠这10个优化点，我们把Multi-Agent工作流成本降了50%以上\|Multi-Agent 成本降 50%]] | raw/ | 腾讯技术工程公众号，作者 lemonye，2026-08-21 |
