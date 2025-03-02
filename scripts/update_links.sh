#!/bin/bash

ENV=${1:-development} # Default to development

if [ "$ENV" = "production" ]; then
    CSS_PATH="https://linduarte.github.io/app/static/css/git-course.css"
    IMG_PATH="https://linduarte.github.io/app/static/images/"
else
    CSS_PATH="/app/static/css/git-course.css"
    IMG_PATH="/app/static/images/"
fi

# Replace placeholders in HTML files
sed -i "s|{CSS_PATH}|$CSS_PATH|g" git-init.html
sed -i "s|{IMG_PATH}|$IMG_PATH|g" git-init.html

echo "Links updated for $ENV environment."
