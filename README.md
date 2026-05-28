<div align="center">

[![Capsule Render](https://capsule-render.vercel.app/api?type=blur&height=220&color=gradient&customColorList=0,2,2,5,30&section=header&text=Knowledge%20Vault&fontSize=32&fontColor=ffffff&animation=scaleIn&desc=raw%20%E2%86%92%20wiki%20%E2%86%92%20output%20%20%7C%20%20%E4%B8%89%E5%B1%82%E7%BB%93%E6%9E%84%E4%B8%AA%E4%BA%BA%E7%9F%A5%E8%AF%86%E5%BA%93&descAlignY=62&descSize=15)](https://github.com/kyechan99/capsule-render)

[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![PowerShell](https://img.shields.io/badge/-PowerShell-5391FE?style=flat-square&logo=powershell&logoColor=white)]()
[![Obsidian](https://img.shields.io/badge/-Obsidian-7C3AED?style=flat-square&logo=obsidian&logoColor=white)]()
[![Git](https://img.shields.io/badge/-Git-F05032?style=flat-square&logo=git&logoColor=white)]()
[![GitHub stars](https://img.shields.io/github/stars/KkOma-value/vault?style=social)](https://github.com/KkOma-value/vault)

</div>

---

> Knowledge Vault 把原始资料、整理后的知识和 LLM 输出分开管理。放入 PDF、Markdown、图片等文件，AI 自动分类、整理、生成结构化知识，最后基于知识库产出摘要、报告和草稿。

## Features

<div align="center">

| | | |
|:---:|:---:|:---:|
| ![Layers](https://img.shields.io/badge/-三层分离-6366F1?style=flat-square) | ![AI](https://img.shields.io/badge/-AI%20驱动-8B5CF6?style=flat-square) | ![Trace](https://img.shields.io/badge/-来源追溯-A78BFA?style=flat-square) |
| **raw / wiki / output** | **自动分类 + 模板生成** | **每条知识可回溯来源** |
| 原始文件、结构化知识、LLM 产出互不干扰 | 按 taxonomy 规则归类，用模板创建知识文件 | wiki 知识记录对应的 raw 来源文件和 SHA-256 |
| | | |
| ![Obsidian](https://img.shields.io/badge/-Obsidian%20兼容-7C3AED?style=flat-square) | ![Git](https://img.shields.io/badge/-Git%20版本管理-F05032?style=flat-square) | ![Auto](https://img.shields.io/badge/-自动登记-10B981?style=flat-square) |
| **标准 Markdown** | **可追踪、可回滚** | **PowerShell 脚本** |
| 直接用 Obsidian 浏览、搜索和编辑 | 所有变更可追踪，大规模整理后可回滚 | 扫描 raw/ 目录，计算哈希，写入摄入日志 |

</div>

## Architecture

```
  ┌─────────────────────────────────────────────────────────────┐
  │                        Knowledge Vault                       │
  │                                                              │
  │   ┌──────────┐     ┌──────────┐     ┌──────────┐           │
  │   │   raw/   │ ──▶ │  wiki/   │ ──▶ │ output/  │           │
  │   │ 原始资料  │     │ 结构知识  │     │ LLM 产出  │           │
  │   └──────────┘     └──────────┘     └──────────┘           │
  │        │                │                  │                 │
  │   pdf / md /        领域索引 /          摘要 / 报告 /        │
  │   img / docx       知识文件 / 模板       草稿                │
  │                                                              │
  │            ┌────────────┐                                    │
  │            │  tools/    │  ingest_raw.ps1 自动登记           │
  │            └────────────┘                                    │
  └─────────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. 放入原始文件

把文件放入 `raw/` 下对应的类型目录：

```
raw/pdf/RAG_Practical_Guide.pdf
raw/md/article-about-llm.md
raw/img/screenshot.png
```

### 2. 让 AI 自动登记并整理

告诉 AI 整理新文件，AI 会自动完成：

- 扫描 `raw/` 下未登记的文件，更新 `_ingestion_log.md`
- 根据 `_taxonomy.md` 判断知识领域
- 使用模板创建知识文件和领域索引
- 更新 `_master_index.md`，标记 `processed`

### 3. 基于 wiki 生成输出

```
请基于 wiki/rag/ 下的内容生成一份学习报告，
输出到 output/reports/rag-learning-report.md
```

## Directory Structure

```text
vault/
├── raw/                           # 原始资料层
│   ├── _ingestion_log.md           # 文件摄入日志
│   ├── pdf/  md/  img/  docx/ misc/
│
├── wiki/                          # 知识整理层
│   ├── _master_index.md            # 全局领域索引
│   ├── _taxonomy.md                # 分类规则
│   ├── _templates/                 # 知识文件模板
│   └── <domain>/                   # 各知识领域
│       ├── _index.md               # 领域索引
│       └── <topic>.md              # 知识文件
│
├── output/                        # LLM 输出层
│   ├── _output_log.md              # 输出记录
│   ├── summaries/  reports/  drafts/
│
└── tools/                         # 工具脚本
    ├── ingest_raw.ps1              # 扫描 raw 并登记新文件
    └── tests/
```

## Commands

```powershell
# 登记 raw 新文件
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\ingest_raw.ps1

# 运行测试
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\tests\test_ingest_raw.ps1

# 提交变更
git add . && git commit -m "docs: update knowledge vault"
```

## AI Processing Rules

<details>
<summary>展开查看给 AI 的 10 条处理原则</summary>

1. 不要修改 `raw/` 中的原始文件
2. 先读 `wiki/_taxonomy.md`，再判断领域归属
3. 优先更新已有领域，只有没有合适领域时才创建新领域
4. 每个新领域都必须有 `_index.md`
5. 每个知识文件都必须保留来源追溯
6. 更新知识文件后，也要更新对应领域 `_index.md`
7. 新增或修改领域后，也要更新 `wiki/_master_index.md`
8. 处理完 raw 文件后，要更新 `raw/_ingestion_log.md` 的状态
9. 生成 output 文件后，要更新 `output/_output_log.md`
10. 大段原文不要直接复制到 wiki；wiki 应该保存整理后的知识

</details>

## Tech Stack

[![Skill Icons](https://skillicons.dev/icons?i=powershell,git,md&theme=light)](https://skillicons.dev)

## Naming Conventions

| 对象 | 规范 | 示例 |
|------|------|------|
| 领域文件夹 | 英文小写 + 连字符 | `wiki/vector-databases/` |
| 知识文件 | 一文件一主题 | `wiki/rag/chunking-strategies.md` |
| 输出文件 | 主题 + 类型 | `output/reports/rag-learning-report.md` |

## License

[MIT](LICENSE) — Built with Markdown, PowerShell, Git & AI

---

<div align="center">

[![Capsule Render Footer](https://capsule-render.vercel.app/api?type=blur&height=80&color=gradient&customColorList=0,2,2,5,30&section=footer)](https://github.com/kyechan99/capsule-render)

</div>
