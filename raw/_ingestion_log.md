# Ingestion Log / 文件摄入日志

Last updated / 最后更新: 2026-08-08

---

<!--
SCHEMA / 格式说明:
| Column      | Description                                          |
|-------------|------------------------------------------------------|
| Raw File    | Relative path from raw/ root                         |
| SHA-256     | First 12 chars of file hash for identity verification|
| Ingested    | Date file was added (YYYY-MM-DD)                     |
| Wiki Target | wiki/ folder that received the knowledge (or -- )    |
| Status      | `pending` / `processed` / `skipped`                |
-->

Run after adding files / 添加文件后运行:

```bash
./tools/ingest_raw.sh
```

| Raw File | SHA-256 | Ingested | Wiki Target | Status |
|----------|---------|----------|-------------|--------|
| Pi 代理 101 - 如何扩展和构建自己的线束.md | 6d678283e3e0 | 2026-07-09 | wiki/pi-agent/ | processed |
| 《克劳德密码》中的模型与努力：知道更多还是努力更多.md | 3ae866666d90 | 2026-07-09 | wiki/claude-code/ | processed |
| Getting started with loops.md | 4c790b5c198d | 2026-07-14 | wiki/claude-code/ | processed |
| How To Actually Design With AI.md | 4177983977fa | 2026-07-15 | wiki/ai-design/ | processed |
| 写给AI 自媒体小白的第一篇教程：《从0 开始做一名AI 博主 》.md | 39b40cc3723b | 2026-07-21 | wiki/ai-self-media/ | processed |
| 彻底告别Loop Engineering：一文读懂 Graph Engineering.md | a53f50aacd71 | 2026-07-21 | wiki/graph-engineering/ | processed |
| Deepseek 梁文锋投资者交流会录音讲了什么.md | 1d41d04bf2fa | 2026-07-24 | wiki/ai-industry/ | processed |
| How Anthropic runs large-scale code migrations with Claude Code.md | 4fed7debbb12 | 2026-07-24 | wiki/code-migration/ | processed |
| 微信群日报工具：每天晚上10点，自动把群聊变成一页PDF.md | a924acfdf9aa | 2026-07-24 | wiki/ai-automation/ | processed |
| Graph Engineering with Claude 14-Step roadmap from 0 to graph architect (Full Course).md | 6f22ec5077ff | 2026-07-26 | wiki/graph-engineering/ | processed |
| 我分析了 100 多个每月收入 5 万美元的 Polymarket 机器人。以下是它们如何从 500 万1500 万加密货币市场中获利。.md | d1738345a3c8 | 2026-07-26 | wiki/algo-trading/ | processed |
| Agent 接入.md | fb88100b14f7 | 2026-07-26 | wiki/ai-tools/ | processed |
| 国行手机用上 eSIM + 最便宜的美国号，保姆级教程手把手带你搞定.md | 97453d09ce19 | 2026-07-29 | wiki/overseas-access/ | processed |
| OpenAI开源的这个安全插件，是每个Vibe Coding的人都必装的神器。.md | 946a04ee3f25 | 2026-08-06 | wiki/ai-security/ | processed |
| Introducing Kitesurf The agent-first browser that runs in V8 isolates on Cloudflare Workers.md | 9590a142fb4a | 2026-08-07 | wiki/ai-tools/ | processed |
| OpenAI 复盘 GPT 入侵 Hugging Face 事件：AI 出现了群体智慧涌现 互相交流技术、隐藏踪迹、清查内鬼 · 小互 · AI 解读站.md | 9722dd268902 | 2026-08-08 | wiki/ai-security/ | processed |
| Original Content 奖励计划.md | 8f9ea37366bd | 2026-08-08 | wiki/ai-self-media/ | processed |
