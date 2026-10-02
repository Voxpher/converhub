<#
.SYNOPSIS
  Creates the final ConvertHub deployment zip (all phases complete).

.DESCRIPTION
  Run this from the folder that CONTAINS the 'converthub' project folder
  (i.e. its parent). It zips the whole project while excluding
  node_modules, build output, local data and OS junk.

  Example:
    cd C:\Users\Akash\Projects
    .\zip-final.ps1

  Output: converthub-final.zip in the current folder.
#>

$ErrorActionPreference = 'Stop'
$projectDir = Join-Path (Get-Location) 'converthub'
if (-not (Test-Path $projectDir)) {
  Write-Host "ERROR: no 'converthub' folder found in $(Get-Location)" -ForegroundColor Red
  Write-Host "Run this script from the parent folder of 'converthub'." -ForegroundColor Yellow
  exit 1
}

$zipName = "converthub-final-$(Get-Date -Format 'yyyyMMdd').zip"
$zipPath = Join-Path (Get-Location) $zipName
if (Test-Path $zipPath) { Remove-Item $zipPath }

# Folders/files never shipped
$excludeDirs = @('node_modules', '.next', 'dist', '.git', 'data', 'coverage', '.turbo', 'test-results', 'playwright-report', 'blob-report')
$excludeFiles = @('.env', '.env.local', 'npm-debug.log')

Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::Open($zipPath, 'Create')
try {
  $files = Get-ChildItem -Path $projectDir -Recurse -File | Where-Object {
    $full = $_.FullName
    $skip = $false
    foreach ($d in $excludeDirs) {
      if ($full -like "*\$d\*") { $skip = $true; break }
    }
    if (-not $skip) {
      foreach ($f in $excludeFiles) {
        if ($_.Name -eq $f) { $skip = $true; break }
      }
    }
    -not $skip
  }
  foreach ($f in $files) {
    $rel = [System.IO.Path]::GetRelativePath((Get-Location).Path, $f.FullName)
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $f.FullName, $rel, 'Optimal') | Out-Null
  }
} finally {
  $zip.Dispose()
}

$entryCount = ([System.IO.Compression.ZipFile]::OpenRead($zipPath)).Entries.Count
$sizeMB = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)
Write-Host ""
Write-Host "Created $zipName" -ForegroundColor Green
Write-Host "  Entries: $entryCount"
Write-Host "  Size:    $sizeMB MB"
Write-Host ""
Write-Host "Sanity checks:" -ForegroundColor Cyan
$check = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
$names = $check.Entries | ForEach-Object { $_.FullName }
$check.Dispose()
foreach ($want in @('converthub\package.json', 'converthub\server\package.json', 'converthub\client\package.json', 'converthub\DEPLOY.md', 'converthub\docker-compose.yml')) {
  if ($names -contains $want) { Write-Host "  [OK] $want" -ForegroundColor Green }
  else { Write-Host "  [MISSING] $want" -ForegroundColor Red }
}
foreach ($bad in @('node_modules', '.next\', '\dist\', '.env') | Where-Object { $names -like "*$_*" }) {
  Write-Host "  [LEAKED] $bad" -ForegroundColor Red
}
Write-Host ""
Write-Host "Next: read converthub\DEPLOY.md inside the zip and follow section 1." -ForegroundColor Yellow
