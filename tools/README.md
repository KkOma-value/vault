# Vault Tools / 工具说明

## Register New Raw Files / 登记新的 raw 文件

Run this after adding files under `raw/`:

```bash
./tools/ingest_raw.sh
```

Options / 可选参数:

```bash
./tools/ingest_raw.sh --root <vault-root>   # override vault root / 指定仓库根目录
./tools/ingest_raw.sh --date 2026-07-09     # override ingest date / 指定登记日期
```

The script scans `raw/`, skips `raw/_ingestion_log.md`, `.gitkeep`, and OS artifacts (`.DS_Store`, `Thumbs.db`, `desktop.ini`), computes each new file's SHA-256 prefix, and appends missing entries to `raw/_ingestion_log.md` as `pending`.

脚本会扫描 `raw/`，跳过 `raw/_ingestion_log.md`、`.gitkeep` 以及系统生成文件（`.DS_Store`、`Thumbs.db`、`desktop.ini`），计算新文件的 SHA-256 前缀，并把未登记文件追加到 `raw/_ingestion_log.md`，状态为 `pending`。

## AI Processing Loop / AI 处理流程

1. Put source files into `raw/pdf`, `raw/md`, `raw/img`, `raw/docx`, or `raw/misc`.
2. Run `tools/ingest_raw.sh`.
3. Ask AI to process `pending` rows in `raw/_ingestion_log.md`.
4. AI chooses or creates a domain using `wiki/_taxonomy.md`.
5. AI writes wiki content from `wiki/_templates/content_template.md`.
6. AI updates the domain `_index.md`, `wiki/_master_index.md`, and marks rows as `processed`.

## Test / 测试

```bash
./tools/tests/test_ingest_raw.sh
```

## Requirements / 环境要求

- `bash`, plus standard Unix tools (`find`, `sed`, `awk`, `grep`, `sort`).
- SHA-256 via `shasum` (macOS/BSD) or `sha256sum` (Linux) — the script auto-detects.
- 依赖 `bash` 与标准 Unix 工具；SHA-256 使用 `shasum`（macOS/BSD）或 `sha256sum`（Linux），脚本自动选择。
