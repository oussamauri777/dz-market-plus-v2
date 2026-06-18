param(
  [string]$DeviceId = "CPH2411",
  [string]$ApiHost = ""
)

# ADB reverse — makes localhost on the phone reach the host machine
$adb = "C:\Android\platform-tools\adb.exe"
if (Test-Path $adb) {
  & $adb reverse --list | Out-Null
  if ($LASTEXITCODE -eq 0) {
    Write-Host "Setting up ADB reverse tcp:3000..." -ForegroundColor Cyan
    & $adb -s $DeviceId reverse tcp:3000 tcp:3000 2>$null
  }
}

# Build the flutter run command
$cmd = "flutter run -d $DeviceId"
if ($ApiHost) {
  $cmd += " --dart-define=API_HOST=$ApiHost"
}

Write-Host "Running: $cmd" -ForegroundColor Cyan
Invoke-Expression $cmd
