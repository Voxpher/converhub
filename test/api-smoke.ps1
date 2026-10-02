param([string]$ApiUrl = 'http://localhost:4000')

# ConvertHub API smoke test (Phase 1).
# Run:  powershell -ExecutionPolicy Bypass -File ./test/api-smoke.ps1
# Needs the stack running:  docker compose up  (or the API on localhost:4000)

$ErrorActionPreference = 'Stop'

function Fail($msg) {
  Write-Host "FAIL: $msg" -ForegroundColor Red
  exit 1
}

Write-Host "ConvertHub API smoke test -> $ApiUrl"

# 1. Health
try {
  $h = Invoke-RestMethod "$ApiUrl/api/health" -TimeoutSec 10
} catch {
  Fail "health endpoint unreachable: $_"
}
if ($h.status -ne 'ok') { Fail "health not ok: $($h | ConvertTo-Json -Compress)" }
Write-Host "PASS: /api/health ok"

# 2. Readiness (Redis + queue)
try {
  $r = Invoke-RestMethod "$ApiUrl/api/health/ready" -TimeoutSec 10
} catch {
  Fail "ready endpoint unreachable: $_"
}
if ($r.status -ne 'ready') { Fail "not ready: $($r | ConvertTo-Json -Compress)" }
Write-Host "PASS: /api/health/ready ok (queue reachable)"

# 3. Tool registry
$tools = Invoke-RestMethod "$ApiUrl/api/tools" -TimeoutSec 10
if (-not $tools.tools -or $tools.tools.Count -lt 30) { Fail "tool registry looks wrong" }
Write-Host "PASS: /api/tools returned $($tools.tools.Count) tools"

# 4. Enqueue a self-test job (exercises queue -> worker -> result -> download)
try {
  $s = Invoke-RestMethod -Method Post "$ApiUrl/api/selftest" -TimeoutSec 10
} catch {
  Fail "selftest enqueue failed: $_"
}
if (-not $s.jobId) { Fail "no jobId returned" }
Write-Host "PASS: selftest enqueued ($($s.jobId))"

# 5. Poll until completed
$deadline = (Get-Date).AddSeconds(60)
do {
  Start-Sleep -Seconds 2
  $j = Invoke-RestMethod "$ApiUrl/api/jobs/$($s.jobId)" -TimeoutSec 10
  Write-Host "  status=$($j.status) progress=$($j.progress)"
  if ($j.status -eq 'failed') { Fail "job failed: $($j.error)" }
  if ((Get-Date) -gt $deadline) { Fail "timed out waiting for job" }
} while ($j.status -ne 'completed')
Write-Host "PASS: job completed"

# 6. Download the result
$out = Join-Path $env:TEMP 'converthub-selftest.txt'
Invoke-WebRequest "$ApiUrl/api/download/$($s.jobId)" -OutFile $out -TimeoutSec 15
if (-not (Test-Path $out)) { Fail "download missing" }
$txt = Get-Content $out -Raw
if ($txt -notmatch 'self-test: OK') { Fail "unexpected download content" }
Write-Host "PASS: download verified ($out)"

Write-Host "ALL CHECKS PASSED" -ForegroundColor Green
