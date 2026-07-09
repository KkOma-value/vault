#!/usr/bin/env bash
#
# ingest_raw.sh — register new files under raw/ into raw/_ingestion_log.md
# 登记 raw/ 下的新文件到 raw/_ingestion_log.md
#
# Usage / 用法:
#   ./tools/ingest_raw.sh [--root <vault-root>] [--date YYYY-MM-DD]
#
# Scans raw/ recursively, skips raw/_ingestion_log.md and .gitkeep files,
# computes each new file's SHA-256 prefix (12 chars), and appends missing
# entries to raw/_ingestion_log.md as `pending`.

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

vault_root="$(cd "$script_dir/.." && pwd)"
date_str="$(date +%Y-%m-%d)"

while [ $# -gt 0 ]; do
    case "$1" in
        --root)
            vault_root="$2"
            shift 2
            ;;
        --date)
            date_str="$2"
            shift 2
            ;;
        *)
            echo "Unknown argument: $1" >&2
            echo "Usage: $0 [--root <vault-root>] [--date YYYY-MM-DD]" >&2
            exit 2
            ;;
    esac
done

vault_root="$(cd "$vault_root" && pwd)"
raw_dir="$vault_root/raw"
log_path="$raw_dir/_ingestion_log.md"

if [ ! -d "$raw_dir" ]; then
    echo "Raw directory not found: $raw_dir" >&2
    exit 1
fi

if [ ! -f "$log_path" ]; then
    echo "Ingestion log not found: $log_path" >&2
    exit 1
fi

# SHA-256 helper: prefer shasum (macOS/BSD), fall back to sha256sum (Linux).
sha256_prefix() {
    if command -v shasum >/dev/null 2>&1; then
        shasum -a 256 "$1" | cut -c1-12
    else
        sha256sum "$1" | cut -c1-12
    fi
}

# Escape a value for use inside a markdown table cell.
escape_cell() {
    printf '%s' "$1" | tr '\n\r' '  ' | sed 's/|/\\|/g'
}

# Collect raw file paths already registered in the log (2nd column is a 12-hex hash).
existing="$(awk -F'|' '
    /^\|/ && $3 ~ /^[[:space:]]*[a-fA-F0-9]{12}[[:space:]]*$/ {
        gsub(/^[[:space:]]+|[[:space:]]+$/, "", $2)
        if ($2 != "Raw File") print $2
    }
' "$log_path")"

is_registered() {
    printf '%s\n' "$existing" | grep -Fxq "$1"
}

new_rows=""
new_count=0

# -print0 / read -d '' handles spaces and unicode in filenames.
while IFS= read -r -d '' file; do
    rel="${file#"$raw_dir"/}"
    base="$(basename "$rel")"

    # Skip the log itself, git placeholders, and OS-generated artifacts.
    case "$base" in
        _ingestion_log.md|.gitkeep|.DS_Store|Thumbs.db|desktop.ini)
            continue
            ;;
    esac

    if is_registered "$rel"; then
        continue
    fi

    hash_prefix="$(sha256_prefix "$file")"
    safe_path="$(escape_cell "$rel")"
    new_rows+="| $safe_path | $hash_prefix | $date_str | -- | pending |"$'\n'
    new_count=$((new_count + 1))
done < <(find "$raw_dir" -type f -print0 | sort -z)

if [ "$new_count" -eq 0 ]; then
    echo "No new raw files."
    exit 0
fi

tmp_log="$(mktemp)"
trap 'rm -f "$tmp_log"' EXIT

# Refresh the "Last updated" date, then append the new rows.
sed -E "s#(Last updated / 最后更新: )[0-9]{4}-[0-9]{2}-[0-9]{2}#\1${date_str}#" "$log_path" > "$tmp_log"

# Ensure the log ends with a newline before appending.
if [ -n "$(tail -c1 "$tmp_log")" ]; then
    printf '\n' >> "$tmp_log"
fi

printf '%s' "$new_rows" >> "$tmp_log"

mv "$tmp_log" "$log_path"
trap - EXIT

echo "Registered $new_count new raw file(s)."
