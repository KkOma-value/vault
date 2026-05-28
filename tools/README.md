# Vault Tools / 工具说明

## Register New Raw Files / 登记新的 raw 文件

Run this after adding files under `raw/`:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\ingest_raw.ps1
```

The script scans `raw/`, skips `raw/_ingestion_log.md`, computes each new file's SHA-256 prefix, and appends missing entries to `raw/_ingestion_log.md` as `pending`.

脚本会扫描 `raw/`，跳过 `raw/_ingestion_log.md`，计算新文件的 SHA-256 前缀，并把未登记文件追加到 `raw/_ingestion_log.md`，状态为 `pending`。

## AI Processing Loop / AI 处理流程

1. Put source files into `raw/pdf`, `raw/md`, `raw/img`, `raw/docx`, or `raw/misc`.
2. Run `tools/ingest_raw.ps1`.
3. Ask AI to process `pending` rows in `raw/_ingestion_log.md`.
4. AI chooses or creates a domain using `wiki/_taxonomy.md`.
5. AI writes wiki content from `wiki/_templates/content_template.md`.
6. AI updates the domain `_index.md`, `wiki/_master_index.md`, and marks rows as `processed`.

## Test / 测试

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\tests\test_ingest_raw.ps1
```
