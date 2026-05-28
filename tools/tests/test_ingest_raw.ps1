$ErrorActionPreference = "Stop"

$scriptPath = Join-Path $PSScriptRoot "..\ingest_raw.ps1"
$tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("vault-ingest-test-" + [guid]::NewGuid().ToString("N"))
$defaultRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("vault-ingest-default-test-" + [guid]::NewGuid().ToString("N"))

function Assert-True {
    param(
        [bool]$Condition,
        [string]$Message
    )

    if (-not $Condition) {
        throw $Message
    }
}

function Count-Matches {
    param(
        [string]$Text,
        [string]$Pattern
    )

    return ([regex]::Matches($Text, [regex]::Escape($Pattern))).Count
}

try {
    New-Item -ItemType Directory -Force -Path `
        (Join-Path $tempRoot "raw\md"),
        (Join-Path $tempRoot "raw\pdf"),
        (Join-Path $tempRoot "wiki"),
        (Join-Path $tempRoot "output") | Out-Null

    @"
# Ingestion Log / 文件摄入日志

Last updated / 最后更新: 2026-05-01

---

| Raw File | SHA-256 | Ingested | Wiki Target | Status |
|----------|---------|----------|-------------|--------|
"@ | Set-Content -LiteralPath (Join-Path $tempRoot "raw\_ingestion_log.md") -Encoding UTF8

    "rag note" | Set-Content -LiteralPath (Join-Path $tempRoot "raw\md\rag-note.md") -Encoding UTF8
    "pdf bytes" | Set-Content -LiteralPath (Join-Path $tempRoot "raw\pdf\paper.pdf") -Encoding UTF8
    "" | Set-Content -LiteralPath (Join-Path $tempRoot "raw\md\.gitkeep") -Encoding UTF8

    & $scriptPath -VaultRoot $tempRoot -Date "2026-05-29" | Out-Null
    & $scriptPath -VaultRoot $tempRoot -Date "2026-05-29" | Out-Null

    $log = Get-Content -LiteralPath (Join-Path $tempRoot "raw\_ingestion_log.md") -Raw

    Assert-True ($log -match "Last updated / 最后更新: 2026-05-29") "Last updated date was not refreshed."
    Assert-True ((Count-Matches $log "| md/rag-note.md |") -eq 1) "Markdown raw file was not registered exactly once."
    Assert-True ((Count-Matches $log "| pdf/paper.pdf |") -eq 1) "PDF raw file was not registered exactly once."
    Assert-True ($log -notmatch "_ingestion_log\.md \|") "The ingestion log registered itself."
    Assert-True ($log -notmatch "\.gitkeep") "The git placeholder file was registered."
    Assert-True ($log -match "\| md/rag-note\.md \| [a-f0-9]{12} \| 2026-05-29 \| -- \| pending \|") "Markdown row format is invalid."
    Assert-True ($log -match "\| pdf/paper\.pdf \| [a-f0-9]{12} \| 2026-05-29 \| -- \| pending \|") "PDF row format is invalid."

    New-Item -ItemType Directory -Force -Path `
        (Join-Path $defaultRoot "tools"),
        (Join-Path $defaultRoot "raw\md") | Out-Null

    Copy-Item -LiteralPath $scriptPath -Destination (Join-Path $defaultRoot "tools\ingest_raw.ps1")

    @"
# Ingestion Log / 文件摄入日志

Last updated / 最后更新: 2026-05-01

---

| Raw File | SHA-256 | Ingested | Wiki Target | Status |
|----------|---------|----------|-------------|--------|
"@ | Set-Content -LiteralPath (Join-Path $defaultRoot "raw\_ingestion_log.md") -Encoding UTF8

    "default root note" | Set-Content -LiteralPath (Join-Path $defaultRoot "raw\md\default-root.md") -Encoding UTF8

    $copiedScriptPath = Join-Path $defaultRoot "tools\ingest_raw.ps1"
    & powershell -NoProfile -ExecutionPolicy Bypass -File $copiedScriptPath -Date "2026-05-29" | Out-Null
    Assert-True ($LASTEXITCODE -eq 0) "Default VaultRoot script execution failed with exit code $LASTEXITCODE."

    $defaultLog = Get-Content -LiteralPath (Join-Path $defaultRoot "raw\_ingestion_log.md") -Raw
    Assert-True ($defaultLog -match "\| md/default-root\.md \| [a-f0-9]{12} \| 2026-05-29 \| -- \| pending \|") "Default VaultRoot did not resolve from the script location."
}
finally {
    if (Test-Path -LiteralPath $tempRoot) {
        Remove-Item -LiteralPath $tempRoot -Recurse -Force
    }

    if (Test-Path -LiteralPath $defaultRoot) {
        Remove-Item -LiteralPath $defaultRoot -Recurse -Force
    }
}
