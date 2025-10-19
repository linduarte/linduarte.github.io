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
$backupDir = Join-Path -Path 'tmp' -ChildPath "backups-restore-$ts"
New-Item -ItemType Directory -Path $backupDir | Out-Null

$report = @()

Write-Host "Starting restore-and-apply: backups -> $backupDir"

foreach ($f in $targets) {
  $entry = [ordered]@{
    file = $f
    existed = $false
    backup = $null
    restored = $false
    restorable_commit = $null
    error = $null
  }
  try {
    if (Test-Path $f) {
      $entry.existed = $true
      $dest = Join-Path -Path $backupDir -ChildPath ($f -replace '[\\/:]','_')
      Copy-Item -Path $f -Destination $dest -Force
      $entry.backup = $dest

      # find up to 200 recent commits touching the file
      $commits = git rev-list --max-count=200 HEAD -- $f 2>$null | Select-Object -First 200
      foreach ($c in $commits) {
        $tmp = [System.IO.Path]::GetTempFileName()
        $showArg = $c + ':' + $f
        $cmdline = "git show $showArg > `"$tmp`""
        & cmd /c $cmdline 2>$null
        if ($LASTEXITCODE -ne 0) { Remove-Item $tmp -ErrorAction SilentlyContinue; continue }
        $has = $false
        try { $has = Select-String -Path $tmp -Pattern $pattern -SimpleMatch -Quiet -ErrorAction SilentlyContinue } catch { $has = $false }
        if (-not $has) {
          # restore this blob
          Copy-Item -Path $tmp -Destination $f -Force
          git add -- $f
          $entry.restored = $true
          $entry.restorable_commit = $c
          Remove-Item $tmp -ErrorAction SilentlyContinue
          break
        }
        Remove-Item $tmp -ErrorAction SilentlyContinue
      }
      if (-not $entry.restored) { $entry.error = 'no_clean_blob_found' }
    } else {
      $entry.error = 'missing'
    }
  } catch {
    $entry.error = $_.ToString()
  }
  $report += $entry
}

$reportPath = Join-Path -Path 'tmp' -ChildPath "restore_report-$ts.json"
$report | ConvertTo-Json -Depth 6 | Set-Content -Path $reportPath -Force
Copy-Item -Path $reportPath -Destination "tmp/restore_report-latest.json" -Force

Write-Host "Wrote full restore report to $reportPath and tmp/restore_report-latest.json"
Write-Host "Summary (restored files):"
$report | Where-Object { $_.restored -eq $true } | ForEach-Object { Write-Host " - $($_.file) -> $($_.restorable_commit)" }
Write-Host "Files not restored:"
$report | Where-Object { $_.restored -ne $true } | ForEach-Object { Write-Host " - $($_.file) ($($_.error))" }
