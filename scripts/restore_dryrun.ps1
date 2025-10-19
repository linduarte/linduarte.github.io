param()

$targets = @(
  'app/static/images/cl_new-tr-100.png',
  'app/static/images/cl_new-tr-200.png',
  'app/static/images/cl_new-tr-400.png',
  'app/static/images/cl_new-tr-800.png',
  'app/static/images/cl_new-tr.png',
  'app/static/images/git-branch_2.webp',
  'app/static/images/git-commit.webp',
  'app/static/images/git-config.webp',
  'app/static/images/git-revert-head.webp',
  'app/static/images/gitgraph-final.webp',
  'app/static/images/html_changes.webp',
  'app/static/images/log_hash.webp'
)

$pattern = '\\?=[0-9]+'
$ts = (Get-Date).ToString('yyyyMMdd-HHmmss')
$report = @()

Write-Host "Starting dry-run restore scan..."

foreach ($f in $targets) {
  $entry = [ordered]@{
    file = $f
    exists = $false
    restorable_commit = $null
    error = $null
  }
  try {
    if (Test-Path $f) {
      $entry.exists = $true
      $commits = git rev-list --max-count=200 HEAD -- $f 2>$null | Select-Object -First 200
      foreach ($c in $commits) {
        $tmp = [System.IO.Path]::GetTempFileName()
        # Build the git show argument to avoid PowerShell parsing issues (don't put $c:$f directly in quotes)
        $showArg = $c + ':' + $f
  $cmdline = "git show $showArg > `"$tmp`""
  & cmd /c $cmdline 2>$null
        if ($LASTEXITCODE -ne 0) { Remove-Item $tmp -ErrorAction SilentlyContinue; continue }
        $has = $false
        try { $has = Select-String -Path $tmp -Pattern $pattern -SimpleMatch -Quiet -ErrorAction SilentlyContinue } catch { $has = $false }
        Remove-Item $tmp -ErrorAction SilentlyContinue
        if (-not $has) { $entry.restorable_commit = $c; break }
      }
    } else {
      $entry.error = 'missing'
    }
  } catch {
    $entry.error = $_.ToString()
  }
  $report += $entry
}

$reportPath = Join-Path -Path 'tmp' -ChildPath "restore_dryrun_report-$ts.json"
if (-not (Test-Path 'tmp')) { New-Item -ItemType Directory -Path 'tmp' | Out-Null }
$report | ConvertTo-Json -Depth 6 | Set-Content -Path $reportPath -Force
Copy-Item -Path $reportPath -Destination "tmp/restore_dryrun_report-latest.json" -Force

Write-Host "Wrote dry-run report to $reportPath and tmp/restore_dryrun_report-latest.json"
Write-Host "`nSummary (restorable files):"
$report | Where-Object { $_.restorable_commit -ne $null } | ForEach-Object { Write-Host " - $($_.file) -> $($_.restorable_commit)" }
Write-Host "`nFiles not restorable automatically:"
$report | Where-Object { $_.restorable_commit -eq $null } | ForEach-Object { Write-Host " - $($_.file) ($($_.error))" }
