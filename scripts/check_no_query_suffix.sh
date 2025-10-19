#!/usr/bin/env bash
# Quick check for accidental '?=NUMBER' tokens in tracked files
set -euo pipefail

echo "Scanning tracked text files for '?=<digits>' tokens (only common text extensions)..."

# Only check common text file extensions to avoid false positives inside binary images
if git grep -nE "\?=[0-9]+" -- '*.html' '*.md' '*.js' '*.css' '*.py' '*.txt' || true; then
    matches=$(git grep -nE "\?=[0-9]+" -- '*.html' '*.md' '*.js' '*.css' '*.py' '*.txt' || true)
    if [ -n "$matches" ]; then
        echo "ERROR: Found '?=NUMBER' tokens in tracked text files. Please sanitize before committing."
        echo "$matches"
        exit 1
    fi
fi

echo "No query-suffix tokens found in tracked text files."
exit 0
