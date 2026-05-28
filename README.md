# Knowledge Vault / 个人知识库系统

这是一个三层结构的个人知识库系统，用来把原始资料、整理后的知识和 LLM 输出分开管理。

核心思路：

- `raw/` 保存原始文件，作为元知识层和事实来源。
- `wiki/` 保存 AI 整理后的知识，作为可检索、可链接、可复用的知识层。
- `output/` 保存 LLM 基于知识库生成的产出，例如摘要、报告、草稿。

这个系统适合配合 Obsidian、Git 和 AI 助手使用。你可以把 PDF、Markdown、Word、图片等文件放入 `raw/`，然后让 AI 根据索引规则把内容整理到 `wiki/`，最后再基于 `wiki/` 生成输出到 `output/`。

---

## 目录结构

```text
D:\vault
├── raw\                         # 原始资料层
│   ├── _ingestion_log.md         # 文件摄入日志
│   ├── pdf\                      # PDF 文件
│   ├── md\                       # Markdown 文件
│   ├── img\                      # 图片
│   ├── docx\                     # Word 文档
│   └── misc\                     # 其他文件
│
├── wiki\                         # 整理后的知识层
│   ├── _master_index.md          # 全局知识领域索引
│   ├── _taxonomy.md              # 分类规则
│   ├── _templates\               # wiki 模板
│   │   ├── domain_index_template.md
│   │   └── content_template.md
│   └── <domain>\                 # 某个知识领域，例如 rag、vector-databases
│       ├── _index.md             # 领域索引
│       └── <topic>.md            # 具体知识文件
│
├── output\                       # LLM 输出层
│   ├── _output_log.md            # 输出记录
│   ├── summaries\                # 摘要
│   ├── reports\                  # 报告
│   └── drafts\                   # 草稿
│
└── tools\                        # 工具脚本
    ├── ingest_raw.ps1            # 扫描 raw 并登记新文件
    ├── README.md                 # 工具说明
    └── tests\                    # 工具测试
```

---

## 三层职责

### 1. `raw/`：原始资料层

`raw/` 只保存原始资料，不在这里做深度整理。

推荐放法：

| 文件类型 | 放置目录 |
|----------|----------|
| PDF | `raw/pdf/` |
| Markdown | `raw/md/` |
| 图片 | `raw/img/` |
| Word 文档 | `raw/docx/` |
| 其他文件 | `raw/misc/` |

每个被扫描到的新文件会登记到：

```text
raw/_ingestion_log.md
```

摄入日志记录这些信息：

- raw 文件路径
- SHA-256 前 12 位，用于识别文件
- 摄入日期
- 对应 wiki 目标
- 当前状态：`pending`、`processed`、`skipped`

状态含义：

| 状态 | 含义 |
|------|------|
| `pending` | 文件已登记，但还没有整理进 wiki |
| `processed` | 文件已经整理进 wiki，并更新了相关索引 |
| `skipped` | 文件被刻意跳过 |

### 2. `wiki/`：知识整理层

`wiki/` 是这个系统最核心的知识层。

它不直接堆放原文，而是保存 AI 或人工整理后的结构化知识，包括：

- 主题摘要
- 关键概念
- 事实和结论
- 来源追溯
- 与其他知识领域的关联

关键文件：

| 文件 | 用途 |
|------|------|
| `wiki/_master_index.md` | 所有知识领域的总索引 |
| `wiki/_taxonomy.md` | 判断文件应该归到哪个领域的分类规则 |
| `wiki/_templates/domain_index_template.md` | 新领域 `_index.md` 模板 |
| `wiki/_templates/content_template.md` | 具体知识文件模板 |

每个知识领域都应该是一个独立文件夹，例如：

```text
wiki/rag/
├── _index.md
├── retrieval-basics.md
└── chunking-strategies.md
```

领域文件夹名称使用英文小写 slug，例如：

- `rag`
- `vector-databases`
- `frontend-development`
- `ai-agents`

领域之间不使用嵌套目录，而是在各自的 `_index.md` 里通过 `Related Domains / 相关领域` 建立链接。

### 3. `output/`：LLM 产出层

`output/` 用来保存 LLM 基于知识库生成的结果。

推荐放法：

| 输出类型 | 放置目录 |
|----------|----------|
| 摘要 | `output/summaries/` |
| 报告 | `output/reports/` |
| 草稿 | `output/drafts/` |

所有输出建议登记到：

```text
output/_output_log.md
```

这样可以追踪：

- 输出文件是什么
- 类型是什么
- 什么时候生成
- 使用了哪些 wiki 或 raw 文件作为来源
- 输出内容的简短说明

---

## 日常工作流

### 步骤 1：放入原始文件

例如你有一个关于 RAG 的 PDF：

```text
RAG_Practical_Guide.pdf
```

把它放到：

```text
raw/pdf/RAG_Practical_Guide.pdf
```

### 步骤 2：登记新文件

在 `D:\vault` 下运行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\ingest_raw.ps1
```

脚本会扫描 `raw/` 下的新文件，并把它们登记为 `pending`。

登记后的 `raw/_ingestion_log.md` 大致会像这样：

```markdown
| Raw File | SHA-256 | Ingested | Wiki Target | Status |
|----------|---------|----------|-------------|--------|
| pdf/RAG_Practical_Guide.pdf | a1b2c3d4e5f6 | 2026-05-29 | -- | pending |
```

### 步骤 3：让 AI 整理 pending 文件

你可以对 AI 说：

```text
请处理 raw/_ingestion_log.md 中所有 pending 文件。
根据 wiki/_taxonomy.md 判断应该归到哪个领域。
如果已有领域合适，就更新该领域；如果没有合适领域，就创建新领域。
处理完成后更新领域 _index.md、wiki/_master_index.md，并把摄入日志状态改为 processed。
```

AI 应该执行这些动作：

1. 读取 `raw/_ingestion_log.md` 中的 `pending` 条目。
2. 读取原始文件内容。
3. 根据 `wiki/_taxonomy.md` 判断知识领域。
4. 使用 `wiki/_templates/content_template.md` 创建知识文件。
5. 如果是新领域，使用 `wiki/_templates/domain_index_template.md` 创建领域 `_index.md`。
6. 更新 `wiki/_master_index.md`。
7. 把摄入日志中的状态从 `pending` 改为 `processed`。

### 步骤 4：基于 wiki 生成输出

例如你想基于 RAG 领域生成一份报告，可以对 AI 说：

```text
请基于 wiki/rag/ 下的内容生成一份 RAG 学习报告，
输出到 output/reports/rag-learning-report.md，
并更新 output/_output_log.md。
```

---

## 简单例子

假设你放入了一个 Markdown 文件：

```text
raw/md/rag-notes.md
```

文件内容大致是：

```markdown
# RAG Notes

RAG combines retrieval and generation. A common pipeline includes document loading,
chunking, embedding, vector search, reranking, and answer generation.
```

运行摄取脚本后，日志可能变成：

```markdown
| Raw File | SHA-256 | Ingested | Wiki Target | Status |
|----------|---------|----------|-------------|--------|
| md/rag-notes.md | 9f86d081884c | 2026-05-29 | -- | pending |
```

AI 整理后，可能会创建：

```text
wiki/rag/
├── _index.md
└── rag-pipeline.md
```

`wiki/rag/rag-pipeline.md` 可能包含：

```markdown
# RAG Pipeline / RAG 流程

<!--
CONTENT METADATA / 内容元数据:
source_raw_files:
  - raw/md/rag-notes.md
domain: rag
created: 2026-05-29
updated: 2026-05-29
tags: rag, retrieval, generation, 检索增强生成
-->

## Summary / 摘要

RAG combines external knowledge retrieval with LLM generation.

RAG 将外部知识检索与大语言模型生成结合起来。

## Key Points / 要点

- A typical RAG pipeline includes loading, chunking, embedding, retrieval, reranking, and generation.
- 典型 RAG 流程包括文档加载、切分、向量化、检索、重排序和生成。
```

同时，`raw/_ingestion_log.md` 会被更新为：

```markdown
| Raw File | SHA-256 | Ingested | Wiki Target | Status |
|----------|---------|----------|-------------|--------|
| md/rag-notes.md | 9f86d081884c | 2026-05-29 | wiki/rag/ | processed |
```

`wiki/_master_index.md` 也会新增一个领域：

```markdown
### rag

- **Title/标题**: Retrieval-Augmented Generation / 检索增强生成
- **Path/路径**: `wiki/rag/`
- **Created/创建**: 2026-05-29
- **Updated/更新**: 2026-05-29
- **Files/文件数**: 1
- **Tags/标签**: rag, llm, retrieval, generation, 检索增强生成
- **Summary/摘要**: Knowledge about retrieval-augmented generation workflows. / 关于检索增强生成工作流的知识。
- **Sources/来源**: `raw/md/rag-notes.md`
```

---

## 命名规范

### 领域文件夹

使用英文小写、连字符分隔：

```text
wiki/vector-databases/
wiki/ai-agents/
wiki/frontend-development/
```

不要使用：

```text
wiki/Vector Databases/
wiki/向量数据库/
wiki/frontend/development/
```

### 知识文件

一个文件只写一个主题：

```text
wiki/rag/chunking-strategies.md
wiki/rag/reranking.md
wiki/vector-databases/hnsw-index.md
```

### 输出文件

输出文件建议带主题和类型：

```text
output/summaries/rag-overview-summary.md
output/reports/vector-database-comparison-report.md
output/drafts/ai-agent-article-draft.md
```

---

## 给 AI 的处理原则

当 AI 处理这个知识库时，应遵守以下原则：

1. 不要修改 `raw/` 中的原始文件。
2. 先读 `wiki/_taxonomy.md`，再判断领域归属。
3. 优先更新已有领域，只有没有合适领域时才创建新领域。
4. 每个新领域都必须有 `_index.md`。
5. 每个知识文件都必须保留来源追溯。
6. 更新具体知识文件后，也要更新对应领域 `_index.md`。
7. 新增或修改领域后，也要更新 `wiki/_master_index.md`。
8. 处理完 raw 文件后，要更新 `raw/_ingestion_log.md` 的状态。
9. 生成 output 文件后，要更新 `output/_output_log.md`。
10. 大段原文不要直接复制到 wiki；wiki 应该保存整理后的知识。

---

## 常用命令

登记 raw 新文件：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\ingest_raw.ps1
```

运行摄取脚本测试：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\tests\test_ingest_raw.ps1
```

查看 Git 状态：

```powershell
git status
```

提交知识库变更：

```powershell
git add .
git commit -m "docs: update knowledge vault"
```

---

## 维护建议

- 定期检查 `raw/_ingestion_log.md`，确保没有长期停留在 `pending` 的文件。
- 定期检查 `wiki/_master_index.md`，确保领域摘要和文件数量准确。
- 当某个领域文件过多时，不要新建嵌套目录，优先通过更清晰的主题文件和相关链接组织。
- 如果 raw 文件变得很大，可以考虑使用 Git LFS，或者只用 Git 追踪索引和 wiki，不追踪大型原始文件。
- 每次大规模整理后，建议提交一次 Git commit，方便回滚。

---

## 当前系统边界

当前已经具备：

- 三层目录结构
- 摄取日志
- 总索引
- 分类规则
- wiki 模板
- output 日志
- raw 文件登记脚本
- 脚本测试
- Git 版本管理

当前还不具备完全自动化的后台监听能力。也就是说，把文件放进 `raw/` 后，需要手动运行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\ingest_raw.ps1
```

然后再让 AI 处理 `pending` 条目。
