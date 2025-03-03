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
# echo "Current directory: $(pwd)"
# echo "CSS_PATH: $CSS_PATH"
# echo "IMG_PATH: $IMG_PATH"
# echo "HTML files in git-course directory:"
# ls -l ../app/templates/git-course/*.html

# Replace placeholders in all HTML files in the git-course directory
for file in ../app/templates/git-course/*.html;
do
    echo "Updating $file"
    sed -i "s|{CSS_PATH}|$CSS_PATH|g" "$file"
    sed -i "s|{IMG_PATH}|$IMG_PATH|g" "$file"
done

echo "Links updated for $ENV environment."
