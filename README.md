<div align="center">

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=28&pause=1000&color=58A6FF&center=true&vCenter=true&multiline=true&repeat=true&width=600&height=100&lines=Knowledge+Vault;raw+%E2%86%92+wiki+%E2%86%92+output;%E4%B8%89%E5%B1%82%E7%BB%93%E6%9E%84%E4%B8%AA%E4%BA%BA%E7%9F%A5%E8%AF%86%E5%BA%93)](https://git.io/typing-svg)

[![GitHub stars](https://img.shields.io/github/stars/KkOma-value/vault?style=social)](https://github.com/KkOma-value/vault)
[![GitHub forks](https://img.shields.io/github/forks/KkOma-value/vault?style=social)](https://github.com/KkOma-value/vault)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![PowerShell](https://img.shields.io/badge/-PowerShell-5391FE?style=flat-square&logo=powershell&logoColor=white)]()
[![Obsidian](https://img.shields.io/badge/-Obsidian-7C3AED?style=flat-square&logo=obsidian&logoColor=white)]()
[![Git](https://img.shields.io/badge/-Git-F05032?style=flat-square&logo=git&logoColor=white)]()

**raw/** &nbsp;原始资料 &rarr; &nbsp;**wiki/** &nbsp;AI 整理后的知识 &rarr; &nbsp;**output/** &nbsp;LLM 生成产出

</div>

---

## 这是什么

Knowledge Vault 是一个三层结构的个人知识库系统，用来把原始资料、整理后的知识和 LLM 输出分开管理。适合配合 Obsidian、Git 和 AI 助手使用。

你可以把 PDF、Markdown、Word、图片等文件放入 `raw/`，然后让 AI 根据索引规则把内容整理到 `wiki/`，最后再基于 `wiki/` 生成输出到 `output/`。

---

## 特性

- **三层分离架构** — raw / wiki / output 各司其职，原始文件、结构化知识、LLM 产出互不干扰
- **自动文件登记** — PowerShell 脚本扫描 `raw/`，计算 SHA-256，自动写入摄入日志
- **AI 驱动整理** — 按 taxonomy 规则自动归类，使用模板生成知识文件和领域索引
- **完整来源追溯** — 每条 wiki 知识都记录对应的 raw 来源文件
- **Obsidian 兼容** — 标准 Markdown 格式，直接用 Obsidian 打开浏览和搜索
- **Git 版本管理** — 所有变更可追踪、可回滚
- **双语支持** — wiki 索引和知识文件使用中英双语标题、标签和摘要

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
│   └── <domain>\                 # 知识领域（如 rag、vector-databases）
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

| 文件类型 | 放置目录 |
|----------|----------|
| PDF | `raw/pdf/` |
| Markdown | `raw/md/` |
| 图片 | `raw/img/` |
| Word 文档 | `raw/docx/` |
| 其他文件 | `raw/misc/` |

每个被扫描到的新文件会登记到 `raw/_ingestion_log.md`，记录以下信息：

- raw 文件路径
- SHA-256 前 12 位（用于识别文件）
- 摄入日期
- 对应 wiki 目标
- 当前状态

| 状态 | 含义 |
|------|------|
| `pending` | 文件已登记，但还没有整理进 wiki |
| `processed` | 文件已经整理进 wiki，并更新了相关索引 |
| `skipped` | 文件被刻意跳过 |

### 2. `wiki/`：知识整理层

`wiki/` 是这个系统最核心的知识层。它不直接堆放原文，而是保存 AI 或人工整理后的结构化知识。

每个知识领域都是一个独立文件夹，例如：

```text
wiki/rag/
├── _index.md
├── retrieval-basics.md
└── chunking-strategies.md
```

关键文件：

| 文件 | 用途 |
|------|------|
| `wiki/_master_index.md` | 所有知识领域的总索引 |
| `wiki/_taxonomy.md` | 判断文件应该归到哪个领域的分类规则 |
| `wiki/_templates/domain_index_template.md` | 新领域 `_index.md` 模板 |
| `wiki/_templates/content_template.md` | 具体知识文件模板 |

领域文件夹名称使用英文小写 slug（如 `rag`、`vector-databases`、`ai-agents`），不使用嵌套目录，通过各自的 `_index.md` 建立关联。

### 3. `output/`：LLM 产出层

`output/` 用来保存 LLM 基于知识库生成的结果。

| 输出类型 | 放置目录 |
|----------|----------|
| 摘要 | `output/summaries/` |
| 报告 | `output/reports/` |
| 草稿 | `output/drafts/` |

所有输出登记到 `output/_output_log.md`，追踪输出文件、类型、生成时间、来源和说明。

---

## 日常工作流

### 1. 放入原始文件

把 PDF、Markdown、Word、图片等文件放入 `raw/` 下对应的类型目录：

```text
raw/pdf/RAG_Practical_Guide.pdf
```

### 2. 让 AI 自动登记并整理

告诉 AI 整理新文件即可，AI 会自动完成以下全部步骤：

- 扫描 `raw/` 下未登记的文件，更新 `raw/_ingestion_log.md`
- 根据 `wiki/_taxonomy.md` 判断知识领域
- 使用模板创建 wiki 知识文件和领域索引
- 更新 `wiki/_master_index.md`
- 把摄入日志状态改为 `processed`

### 3. 基于 wiki 生成输出

> 请基于 `wiki/rag/` 下的内容生成一份 RAG 学习报告，输出到 `output/reports/rag-learning-report.md`，并更新 `output/_output_log.md`。

---

## 命名规范

| 对象 | 规范 | 示例 |
|------|------|------|
| 领域文件夹 | 英文小写 + 连字符 | `wiki/vector-databases/` |
| 知识文件 | 一文件一主题 | `wiki/rag/chunking-strategies.md` |
| 输出文件 | 主题 + 类型 | `output/reports/rag-learning-report.md` |

---

## 常用命令

```powershell
# 登记 raw 新文件
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\ingest_raw.ps1

# 运行摄取脚本测试
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\tests\test_ingest_raw.ps1

# 查看 Git 状态
git status

# 提交知识库变更
git add .
git commit -m "docs: update knowledge vault"
```

---

## 给 AI 的处理原则

1. 不要修改 `raw/` 中的原始文件
2. 先读 `wiki/_taxonomy.md`，再判断领域归属
3. 优先更新已有领域，只有没有合适领域时才创建新领域
4. 每个新领域都必须有 `_index.md`
5. 每个知识文件都必须保留来源追溯
6. 更新具体知识文件后，也要更新对应领域 `_index.md`
7. 新增或修改领域后，也要更新 `wiki/_master_index.md`
8. 处理完 raw 文件后，要更新 `raw/_ingestion_log.md` 的状态
9. 生成 output 文件后，要更新 `output/_output_log.md`
10. 大段原文不要直接复制到 wiki；wiki 应该保存整理后的知识

---

## 维护建议

- 定期检查 `raw/_ingestion_log.md`，确保没有长期停留在 `pending` 的文件
- 定期检查 `wiki/_master_index.md`，确保领域摘要和文件数量准确
- 当某个领域文件过多时，优先通过更清晰的主题文件和相关链接组织，不要新建嵌套目录
- 如果 raw 文件变得很大，可以考虑使用 Git LFS
- 每次大规模整理后，建议提交一次 Git commit，方便回滚

---

## 当前系统边界

**已具备：** 三层目录结构 | 摄取日志 | 总索引 | 分类规则 | wiki 模板 | output 日志 | raw 文件登记脚本 | 脚本测试 | Git 版本管理

**暂不具备：** 完全自动化的后台监听能力。放入 `raw/` 后需手动运行脚本登记，然后让 AI 处理 `pending` 条目。

---

<div align="center">

<sub>Built with Markdown, PowerShell, Git & AI</sub>

</div>
