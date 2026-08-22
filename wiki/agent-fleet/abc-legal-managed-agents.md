# ABC Legal 案例：全员构建 Agent

<!--
内容元数据:
source_raw_files:
  - raw/How ABC Legal turned every employee into a builder with Claude Managed Agents.md
domain: agent-fleet
created: 2026-08-18
updated: 2026-08-18
tags: managed-agents, agent-as-code, harvester-tuner, 企业案例, claude, fleet-governance, 成本优化, 非开发者
related:
  - wiki/ai-automation/_index.md
  - wiki/code-migration/code-migration-methodology.md
-->

## 摘要

ABC Legal（美国法律文书送达公司，1100 人）在全公司部署 Claude Managed Agents，实现 50+ 生产 agent、~310 名员工日常使用、部分任务成本降低 ~50%。关键模式：agent-as-code（git 管理一切）、非开发者一周构建生产 agent、harvester-tuner 三角色反馈循环、价值/成本效率比驱动的 J 曲线优化。

---

## 要点

- **Agent-as-code**：prompt + config + 工具列表 + 凭据 + memory 全部存 git，通过 PR 审核变更，merge 即部署。两套模板：事件驱动型 / 定时调度型。
- **非开发者构建**：15 人跨部门委员会（财务/营销/运营/开发）用 Claude Code 克隆模板一周内完成 agent，再培训各自团队，一个月内 50+ agent 上线。
- **Harvester-Tuner 三角色自改进循环**：
  1. Initial Agent：实时做任务，记录审计轨迹
  2. Harvester：每小时/每天从 Slack thread & emoji reaction 收集人类反馈→标注数据
  3. Tuner：每周跨数据分析，起草 prompt/config 修改的 PR→人审后 merge
- **信任阶梯**：agent 起步为推荐模式（人审后行动），证明与人类判断一致后才升级为自动化模式，升级后仍持续测量。
- **成本 J 曲线**：新 agent 初期亏损（大模型 + 未优化），写 eval → 降模型 → 削 token 后翻正。追踪效率比 = 产出价值 / 运行成本。
- **模型选择**：默认 Sonnet，高频快任务用 Haiku，深度推理用 Opus，切换一行配置。
- **Deliveries-as-code**：业务路由规则全部 YAML 化存 git，4 个 agent 组成闭环（判定→收集反馈→提 PR→合并后推生产），emoji reaction 一周内变成生产规则变更。

---

## 详细内容

### 舰队架构

```
git repo (agent definitions)
├── agent-a/
│   ├── config.json        # 工具列表、模型、调度
│   ├── system-prompt.md   # 系统提示词
│   ├── deploy.sh          # 部署脚本
│   └── README.md          # 运维文档
├── agent-b/
│   └── ...
└── templates/
    ├── event-driven/      # 事件触发模板
    └── scheduled/         # 定时调度模板
```

Merge to main = deploy。Bitbucket Pipelines 处理仓库访问、secrets、计费。

### 典型 Agent 示例

| Agent | 触发 | 任务 | 价值 |
|-------|------|------|------|
| AI Code Reviewer | PR 创建 | 多模型安全/性能/凭据扫描 | 工程师 merge 前等其审核 |
| EvidenceChain Delivery | 每日定时 | 拉数据库报告→浏览器取 PDF→FTP 上传 | 账户经理1小时构建，替代手工周任务 |
| eFiling Rejection Diagnoser | 法院退回 | 读退回详情+法院规则→Slack 诊断 | 从数小时压缩到约1分钟 |
| AR Remittance | 邮件到达 | 解析汇款邮件→构建 NetSuite 文件→Slack 审批→导入 | 财务自动化 |
| Charvis (合规审查) | 任务完成 | 检查送达任务合规性 | 与合规团队 98% 一致率 |

### 最佳实践

1. **一切皆代码**：LLM 是文本引擎，越多业务变成 repo 中的文本，agent 杠杆越大。
2. **起步人在环中**：agent 先发推荐，证明判断一致后才独立行动。
3. **PR 即控制面**：想让 agent 参与决策，就让决策看起来像 PR。
4. **投资反馈循环**：Slack emoji + thread → harvester → tuner → PR，agent 无需重训就能改进。
5. **不是每个任务都值得 agent**：价值/成本比是硬约束。
6. **真正难点是 git 而非 AI**：让业务人员学 clone/PR 比教 AI 本身更费劲。

---

## 来源备注

| 原始文件 | 位置 | 备注 |
|----------|------|------|
| [[raw/How ABC Legal turned every employee into a builder with Claude Managed Agents\|ABC Legal Managed Agents]] | raw/ | Anthropic blog, 2026-08-17, CTO Brandon Fuller |
