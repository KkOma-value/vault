# AI HOT：Agent Skill 与 API 接入

<!--
source_raw_files:
  - raw/Agent 接入.md
domain: ai-tools
created: 2026-08-06
updated: 2026-08-06
tags: aihot, agent-skill, rss, api, claude-code, codex, gemini-cli
related:
  - wiki/claude-code/loops.md
-->

## 摘要

AI HOT 提供匿名只读公开 API，可接入 Claude Code、Codex、Gemini CLI 等支持 Agent Skills 的工具，同步中文 AI 资讯精选、7 天动态与 AI 日报，无需 API Key。

---

## 要点

- **安装方式**: 让 Agent 读取 `https://aihot.virxact.com/aihot-skill/README.md` 并安装 Skill
- **能力**: 过去 24h 资讯、最近 7 天动态、当前热点、AI 日报、全量精选同步+增量更新
- **速率限制**: 带 `If-None-Match` 条件轮询，items 60s / hot-topics 300s / RSS 30min；429 后按 `Retry-After` 退避
- **API 迁移**: `/api/public/*` 于 2026-12-31 停服，换用 `/api/v1/*`
- **契约**: v1 不删除/改名/改变字段类型，但不承诺 SLA，需自行设置缓存、重试和降级

---

## 详细内容

### 安装验证流程

1. 让 Agent 读取 README.md + manifest.sha256 + SKILL.md，确认只访问 AI HOT 公开只读接口
2. Agent 报告写入目录和文件清单
3. 安装后开新会话，问"过去 24 小时 AI 圈最重要的 5 件事是什么？"验证

### 典型查询

- `最近一周最值得关注的 5 条 AI 资讯是什么？`
- `现在 AI 圈最热的事件是什么？`
- `给我今天的 AI 日报。`
- `把 AI HOT 当前全部精选同步到本地，以后只接收变化。`

### 注意事项

- 摘要和翻译由 AI 生成，引用数字/政策/原话前需通过原文 URL 复核
- 对外发布保留 attribution/canonical
- 更新 Skill 时原子替换当前会话加载的同一目录，不要写到其他 Agent 目录

---

## 来源备注

| 原始文件 | 位置 | 备注 |
|----------|------|------|
| [[raw/Agent 接入.md\|Agent 接入]] | raw/ | AI HOT 官方接入文档，来自 aihot.virxact.com/agent |
