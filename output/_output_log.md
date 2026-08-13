# Output Log / 输出日志

Last updated / 最后更新: 2026-08-14

---

<!--
SCHEMA / 格式说明:
| Column          | Description                                        |
|-----------------|----------------------------------------------------|
| Output File     | Relative path from output/ root                    |
| Type/类型       | `summary` / `report` / `draft`                    |
| Generated/生成  | Date generated (YYYY-MM-DD)                        |
| Source/来源     | Wiki content files or raw files used as input      |
| Description     | Brief description of the output                    |
-->

| Output File | Type/类型 | Generated/生成 | Source/来源 | Description/描述 |
|-------------|-----------|----------------|-------------|------------------|
| summaries/agent-orchestration-summary.md | summary | 2026-08-14 | wiki/claude-code/, wiki/graph-engineering/, wiki/code-migration/, wiki/pi-agent/ | 跨领域摘要：Agent 编排方法论全景（Prompt→Loop→Graph、四类循环、模型分层、judge、compaction），整合 7 份知识文件 |
| summaries/ai-monetization-summary.md | summary | 2026-08-14 | wiki/ai-self-media/, wiki/indie-dev/, wiki/algo-trading/, wiki/ai-industry/ | 跨领域摘要：AI 时代个人变现三条路径（自媒体/独立开发/算法交易）对比、要点与风险 |
| reports/ai-agent-security-report.md | report | 2026-08-14 | wiki/ai-security/ | 报告：AI 安全攻防全景——OpenAI–HF 全自动入侵复盘、Codex Security 扫描、Long Agent 沙箱，攻防失衡分析与防守建议 |
| reports/local-first-ai-toolchain-report.md | report | 2026-08-14 | wiki/ai-automation/, wiki/pi-agent/, wiki/ai-security/, wiki/ai-tools/, wiki/overseas-access/ | 报告：本地优先 AI 工具链落地——自动化范式、执行沙箱、Agent 内核、Skill/浏览器接入、参考架构与检查清单 |
| drafts/draft-context-compaction.md | draft | 2026-08-14 | wiki/pi-agent/pi-compaction.md, wiki/claude-code/ | 文章草稿 v1：上下文压缩机制解读（溢出原因、LLM 摘要式压缩、prompt cache 账单），面向开发者 |
| drafts/draft-graph-engineering-intro.md | draft | 2026-08-14 | wiki/graph-engineering/, wiki/code-migration/ | 文章草稿 v1：Graph Engineering 入门（演进、七原则、五问、14 步核心武器、迁移案例、反模式清单） |
