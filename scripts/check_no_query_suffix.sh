#!/bin/bash
# Quick check for accidental '?=NUMBER' tokens in tracked files
set -euo pipefail

echo "Scanning tracked files for '?=<digits>' tokens (excluding report/artifact dirs)..."
# Exclude known artifact directories and binary image folder to avoid false positives
EXCLUDES=(
    ':(exclude)reports_download'
    ':(exclude)reports_download_ci'
    ':(exclude)reports_download_ci_latest*'
    ':(exclude)reports_local'
    ':(exclude)reports_download_ci_latest_run'
    ':(exclude)tmp'
    ':(exclude)server.log'
    ':(exclude)app/static/images'
)

if git grep -nE "\?=[0-9]+" -- "${EXCLUDES[@]}" .; then
        echo "ERROR: Found '?=NUMBER' tokens in tracked source files. Please sanitize before committing."
        exit 1
fi

echo "No query-suffix tokens found in source files."
exit 0
