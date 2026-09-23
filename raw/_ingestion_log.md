# Ingestion Log / 文件摄入日志

Last updated / 最后更新: 2026-09-23

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
| AI primer.md | dd67cecc59ba | 2026-09-22 | wiki/machine-native-intelligence/ | processed |
| Introduction.md | 4ac6ff94eeeb | 2026-09-22 | wiki/machine-native-intelligence/ | processed |
| UIUX 设计指南：什么是 UI 设计师？与 UX 设计师有何不同？.md | c73c727e9e26 | 2026-09-22 | wiki/ui-ux-design/ | processed |
| VibeHub 上线一个月突破 5 万访客：自然流量留存与「路线」功能迭代.md | ac952e9d06f6 | 2026-09-22 | wiki/indie-product-growth/ | processed |
| 半年副业做到小红书 2 万粉：我的选题记录、制作流程与三类收入.md | ce31843cb6ea | 2026-09-22 | wiki/self-media-growth/ | processed |
| 放弃手写界面后，我用 Codex 搭配飞书 CLI 搭建了创作工作台.md | b78c035f92e1 | 2026-09-22 | wiki/ai-assisted-workflow/ | processed |
| 用 Semrush 挖掘长尾词，让 AI 结合源码批量优化 VibeHub 的页面 SEO.md | 2c5d7f1cc973 | 2026-09-22 | wiki/indie-product-growth/ | processed |
| Effective context engineering for AI agents.md | 084ad93558de | 2026-09-23 | wiki/context-engineering/ | processed |
| Learning Dynamic Context Management in LLMs through Human-in-the-Loop Curation A Proposed Framework From Basic Tools to Hierarchical Abstraction.md | bf5f11064154 | 2026-09-23 | wiki/context-engineering/ | processed |
| 上下文编辑.md | 9a372e1235c9 | 2026-09-23 | wiki/context-engineering/ | processed |
| 我把 463 个 AI 视频做成了 Skill 和提示语模版，全都开源！.md | d484f1c8e36b | 2026-09-23 | wiki/ai-video-creation/ | processed |
