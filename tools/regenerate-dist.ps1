# tools/regenerate-dist.ps1
# Simple helper to recreate the dist/ directory from app/ sources.
# Usage (pwsh): .\tools\regenerate-dist.ps1

param(
    [switch]$Force
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $root

if (Test-Path .\dist) {
    if ($Force) {
        Remove-Item -Recurse -Force .\dist
    } else {
        Write-Host "dist/ already exists. Use -Force to recreate." -ForegroundColor Yellow
        exit 0
    }
}

New-Item -ItemType Directory -Path .\dist | Out-Null
New-Item -ItemType Directory -Path .\dist\templates -Force | Out-Null
New-Item -ItemType Directory -Path .\dist\static -Force | Out-Null

Write-Host "Copying templates..."
Copy-Item -Path .\app\templates\* -Destination .\dist\templates -Recurse -Force
Write-Host "Copying static assets..."
Copy-Item -Path .\app\static\* -Destination .\dist\static -Recurse -Force

Write-Host "dist/ recreated from app/ (templates + static)." -ForegroundColor Green
