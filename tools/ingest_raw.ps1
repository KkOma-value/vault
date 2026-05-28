[CmdletBinding()]
param(
    [string]$VaultRoot,
    [string]$Date = (Get-Date -Format "yyyy-MM-dd")
)

$ErrorActionPreference = "Stop"

$scriptDirectory = $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($scriptDirectory)) {
    $scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
}

if ([string]::IsNullOrWhiteSpace($VaultRoot)) {
    $VaultRoot = Join-Path $scriptDirectory ".."
}

function Convert-ToMarkdownPath {
    param([string]$Path)
    return ($Path -replace "\\", "/")
}

function Get-RelativeFilePath {
    param(
        [string]$BaseDirectory,
        [string]$FilePath
    )

    $basePath = (Resolve-Path -LiteralPath $BaseDirectory).Path
    if (-not $basePath.EndsWith([System.IO.Path]::DirectorySeparatorChar)) {
        $basePath += [System.IO.Path]::DirectorySeparatorChar
    }

    $baseUri = New-Object System.Uri($basePath)
    $fileUri = New-Object System.Uri((Resolve-Path -LiteralPath $FilePath).Path)
    $relativeUri = $baseUri.MakeRelativeUri($fileUri)

    return [System.Uri]::UnescapeDataString($relativeUri.ToString()).Replace("/", [System.IO.Path]::DirectorySeparatorChar)
}

function Escape-MarkdownCell {
    param([string]$Value)
    return (($Value -replace "\r?\n", " ") -replace "\|", "\|")
}

function Get-ExistingRawFiles {
    param([string]$LogText)

    $existing = @{}
    foreach ($line in ($LogText -split "\r?\n")) {
        if ($line -match "^\|\s*([^|]+?)\s*\|\s*[a-fA-F0-9]{12}\s*\|") {
            $rawFile = $Matches[1].Trim()
            if ($rawFile -ne "Raw File") {
                $existing[$rawFile] = $true
            }
        }
    }

    return $existing
}

$resolvedVaultRoot = (Resolve-Path -LiteralPath $VaultRoot).Path
$rawDir = Join-Path $resolvedVaultRoot "raw"
$logPath = Join-Path $rawDir "_ingestion_log.md"

if (-not (Test-Path -LiteralPath $rawDir -PathType Container)) {
    throw "Raw directory not found: $rawDir"
}

if (-not (Test-Path -LiteralPath $logPath -PathType Leaf)) {
    throw "Ingestion log not found: $logPath"
}

$logText = Get-Content -LiteralPath $logPath -Raw -Encoding UTF8
$existingRawFiles = Get-ExistingRawFiles -LogText $logText

$rawFiles = Get-ChildItem -LiteralPath $rawDir -Recurse -File -Force |
    Where-Object { $_.FullName -ne $logPath -and $_.Name -ne ".gitkeep" } |
    Sort-Object FullName

$newRows = foreach ($file in $rawFiles) {
    $relativePath = Get-RelativeFilePath -BaseDirectory $rawDir -FilePath $file.FullName
    $markdownPath = Convert-ToMarkdownPath -Path $relativePath

    if ($existingRawFiles.ContainsKey($markdownPath)) {
        continue
    }

    $hashPrefix = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash.Substring(0, 12).ToLowerInvariant()
    $safePath = Escape-MarkdownCell -Value $markdownPath
    "| $safePath | $hashPrefix | $Date | -- | pending |"
}

if ($newRows.Count -eq 0) {
    Write-Output "No new raw files."
    exit 0
}

$updatedLogText = [regex]::Replace(
    $logText,
    "Last updated / 最后更新: \d{4}-\d{2}-\d{2}",
    "Last updated / 最后更新: $Date"
)

if (-not $updatedLogText.EndsWith("`n")) {
    $updatedLogText += "`n"
}

$updatedLogText += (($newRows -join "`n") + "`n")
Set-Content -LiteralPath $logPath -Value $updatedLogText -Encoding UTF8

Write-Output "Registered $($newRows.Count) new raw file(s)."
