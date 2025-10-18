#!/bin/bash

ENV=${1:-development} # Default to development

if [ "$ENV" = "production" ]; then
    CSS_PATH="https://linduarte.github.io/app/static/css/git-course.css"
    IMG_PATH="https://linduarte.github.io/app/static/images/"
else
    CSS_PATH="/app/static/css/git-course.css"
    IMG_PATH="/app/static/images/"
fi

# Debugging: Print the current directory and file paths
echo "Current directory: $(pwd)"
echo "CSS_PATH: $CSS_PATH"
echo "IMG_PATH: $IMG_PATH"
echo "HTML files in git-course directory:"
ls -l ../app/templates/git-course/*.html

# Replace any existing paths with placeholders first, using a safe temp file
for file in ../app/templates/git-course/*.html; do
    echo "Resetting $file to placeholders (safe edit)"
    tmpfile=$(mktemp)
    # perform replacements and also remove accidental '?=<digits>' tokens
    sed \
        -e "s|https://linduarte.github.io/app/static/css/git-course.css|{CSS_PATH}|g" \
        -e "s|https://linduarte.github.io/app/static/images/|{IMG_PATH}|g" \
        -e "s|/app/static/css/git-course.css|{CSS_PATH}|g" \
        -e "s|/app/static/images/|{IMG_PATH}|g" \
        -e "s/\?=\([0-9]\+\)//g" "$file" > "$tmpfile"
    mv "$tmpfile" "$file"
done

# Replace placeholders with the appropriate paths, again via safe temp file
for file in ../app/templates/git-course/*.html; do
    echo "Updating $file for $ENV environment (safe edit)"
    tmpfile=$(mktemp)
    sed \
        -e "s|{CSS_PATH}|$CSS_PATH|g" \
        -e "s|{IMG_PATH}|$IMG_PATH|g" \
        -e "s/\?=\([0-9]\+\)//g" "$file" > "$tmpfile"
    mv "$tmpfile" "$file"
done

echo "Links updated for $ENV environment."
