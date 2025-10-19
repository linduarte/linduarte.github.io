# CI wrapper: install deps and run generator (PowerShell)
param(
  [string]$InputJson = 'reports_image_candidates_summary.json',
  [string]$OutDir = 'tmp/generated-images'
)
Write-Host 'Installing node dependencies (npm ci)...'
npm ci
Write-Host 'Running generator...'
node scripts/ci_generate_variants.js --input=$InputJson --out=$OutDir
Write-Host 'Done.'
