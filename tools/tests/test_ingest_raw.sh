#!/usr/bin/env bash
#
# test_ingest_raw.sh — tests for tools/ingest_raw.sh
# tools/ingest_raw.sh 的测试

set -euo pipefail

test_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
script_path="$test_dir/../ingest_raw.sh"

temp_root="$(mktemp -d "${TMPDIR:-/tmp}/vault-ingest-test.XXXXXX")"
default_root="$(mktemp -d "${TMPDIR:-/tmp}/vault-ingest-default-test.XXXXXX")"

cleanup() {
    rm -rf "$temp_root" "$default_root"
}
trap cleanup EXIT

assert_true() {
    if [ "$1" != "true" ]; then
        echo "FAIL: $2" >&2
        exit 1
    fi
}

count_matches() {
    # count_matches <file> <fixed-string>
    grep -F -c -- "$2" "$1" || true
}

write_log() {
    cat > "$1" <<'EOF'
# Ingestion Log / 文件摄入日志

Last updated / 最后更新: 2026-05-01

---

| Raw File | SHA-256 | Ingested | Wiki Target | Status |
|----------|---------|----------|-------------|--------|
EOF
}

# --- Case 1: explicit --root, idempotent double run ---
mkdir -p "$temp_root/raw/md" "$temp_root/raw/pdf" "$temp_root/wiki" "$temp_root/output"
write_log "$temp_root/raw/_ingestion_log.md"

printf 'rag note\n'  > "$temp_root/raw/md/rag-note.md"
printf 'pdf bytes\n' > "$temp_root/raw/pdf/paper.pdf"
printf ''           > "$temp_root/raw/md/.gitkeep"
printf 'os junk\n'  > "$temp_root/raw/.DS_Store"

bash "$script_path" --root "$temp_root" --date "2026-05-29" > /dev/null
bash "$script_path" --root "$temp_root" --date "2026-05-29" > /dev/null

log="$temp_root/raw/_ingestion_log.md"

assert_true "$([ "$(grep -c 'Last updated / 最后更新: 2026-05-29' "$log")" -ge 1 ] && echo true || echo false)" \
    "Last updated date was not refreshed."
assert_true "$([ "$(count_matches "$log" '| md/rag-note.md |')" -eq 1 ] && echo true || echo false)" \
    "Markdown raw file was not registered exactly once."
assert_true "$([ "$(count_matches "$log" '| pdf/paper.pdf |')" -eq 1 ] && echo true || echo false)" \
    "PDF raw file was not registered exactly once."
assert_true "$(grep -q '_ingestion_log.md |' "$log" && echo false || echo true)" \
    "The ingestion log registered itself."
assert_true "$(grep -q '.gitkeep' "$log" && echo false || echo true)" \
    "The git placeholder file was registered."
assert_true "$(grep -q '.DS_Store' "$log" && echo false || echo true)" \
    "The .DS_Store OS artifact was registered."
assert_true "$(grep -Eq '\| md/rag-note\.md \| [a-f0-9]{12} \| 2026-05-29 \| -- \| pending \|' "$log" && echo true || echo false)" \
    "Markdown row format is invalid."
assert_true "$(grep -Eq '\| pdf/paper\.pdf \| [a-f0-9]{12} \| 2026-05-29 \| -- \| pending \|' "$log" && echo true || echo false)" \
    "PDF row format is invalid."

# --- Case 2: default root resolves from the script location ---
mkdir -p "$default_root/tools" "$default_root/raw/md"
cp "$script_path" "$default_root/tools/ingest_raw.sh"
write_log "$default_root/raw/_ingestion_log.md"
printf 'default root note\n' > "$default_root/raw/md/default-root.md"

bash "$default_root/tools/ingest_raw.sh" --date "2026-05-29" > /dev/null
assert_true "$([ "$?" -eq 0 ] && echo true || echo false)" \
    "Default root script execution failed."

default_log="$default_root/raw/_ingestion_log.md"
assert_true "$(grep -Eq '\| md/default-root\.md \| [a-f0-9]{12} \| 2026-05-29 \| -- \| pending \|' "$default_log" && echo true || echo false)" \
    "Default root did not resolve from the script location."

# --- Case 3: unicode / spaces in filename ---
printf 'unicode article\n' > "$temp_root/raw/《测试 文章》.md"
bash "$script_path" --root "$temp_root" --date "2026-05-29" > /dev/null
assert_true "$([ "$(count_matches "$log" '《测试 文章》.md')" -eq 1 ] && echo true || echo false)" \
    "Unicode filename with spaces was not registered exactly once."

echo "All tests passed."
