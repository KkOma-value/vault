# Taxonomy / 知识分类规则

Last updated / 最后更新: 2026-09-23

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
| machine-native-intelligence | 机器原生智能 | 面向机器消费的结构化决策模型、概率校准与 AI 原语 | machine-native-intelligence, decision-models, calibration, rlcd, system-one |
| ui-ux-design | UI/UX 设计 | 界面与体验设计的概念、区别、协作与职业路径 | ui, ux, design, frontend, interaction-design, cognitive-bias |
| self-media-growth | 自媒体成长 | 个人自媒体的选题、制作流程、效率工具与变现 | self-media, content-creation, xiaohongshu, side-business, monetization |
| indie-product-growth | 独立产品增长 | 独立产品的自然流量留存、功能迭代与 SEO 增长 | indie-product, growth, seo, traffic, retention, vibe-coding |
| ai-assisted-workflow | AI 辅助工作流 | 用 AI Agent、CLI 与 Skill 搭建个人工作台与云端知识库 | ai-workflow, codex, lark-cli, skill, multi-agent, knowledge-base |
| context-engineering | 上下文工程 | LLM 上下文窗口的管理策略与工具：注意力预算、检索、压缩、人在回路管理 | context-engineering, llm, agents, attention-budget, compaction, memory, context-editing |
| ai-video-creation | AI 视频创作 | AI 视频生成的提示语模板、Skill 方法论与实测复现经验 | ai-video, seedance, prompt-templates, skill, video-generation, aesthetic |

---

## Status Semantics / 状态语义

- `pending`: registered in `raw/_ingestion_log.md`, not yet organized into wiki.
- `processed`: content has been summarized, placed in wiki, and indexes were updated.
- `skipped`: intentionally not processed; add a short reason in the log or commit message.
