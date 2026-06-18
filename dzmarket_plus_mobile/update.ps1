param(
  [string]$ApiHost = "",
  [string]$VersionName = "",
  [int]$VersionCode = 0
)

Write-Host "═══ DZ Market+ - Update & Publish ═══" -ForegroundColor Cyan
Write-Host ""

# Check required
if (-not $ApiHost) {
  Write-Host "ERROR: You must provide -ApiHost (your production server URL)" -ForegroundColor Red
  Write-Host "Example: .\update.ps1 -ApiHost api.dzmarket.com -VersionName 1.1.0 -VersionCode 2" -ForegroundColor Yellow
  exit 1
}

# Read current version from pubspec.yaml
$pubspec = Get-Content "pubspec.yaml" -Raw
$currentVersion = if ($pubspec -match 'version:\s*([\d.]+)\+(\d+)') {
  $matches[0]
} else { "" }

Write-Host "Current version in pubspec.yaml: $currentVersion" -ForegroundColor Gray
Write-Host ""

# Prompt for version if not provided
if (-not $VersionName) {
  $VersionName = Read-Host "Enter new version name (e.g. 1.1.0)"
}
if ($VersionCode -eq 0) {
  $VersionCode = [int](Read-Host "Enter new version code (e.g. 2)")
}

# Update pubspec.yaml
Write-Host ""
Write-Host "Updating pubspec.yaml to $VersionName+$VersionCode..." -ForegroundColor Yellow
$pubspec = $pubspec -replace 'version:\s*[\d.]+\+\d+', "version: $VersionName+$VersionCode"
Set-Content "pubspec.yaml" $pubspec

# Update build.gradle.kts versionCode and versionName
$gradleFile = "android\app\build.gradle.kts"
$gradle = Get-Content $gradleFile -Raw
$gradle = $gradle -replace 'versionCode\s*=\s*\d+', "versionCode = $VersionCode"
$gradle = $gradle -replace 'versionName\s*=\s*"[\d.]+"', "versionName = `"$VersionName`""
Set-Content $gradleFile $gradle

Write-Host "Version updated: $VersionName (code $VersionCode)" -ForegroundColor Green
Write-Host ""

# Confirm
Write-Host "About to build with API host: $ApiHost" -ForegroundColor Cyan
$confirm = Read-Host "Proceed with release build? (y/N)"
if ($confirm -ne 'y' -and $confirm -ne 'Y') {
  Write-Host "Cancelled." -ForegroundColor Yellow
  exit 0
}

# Build
Write-Host ""
Write-Host "Cleaning..." -ForegroundColor Yellow
flutter clean 2>$null
flutter pub get 2>$null

Write-Host "Building release AAB..." -ForegroundColor Yellow
$cmd = "flutter build appbundle --release --dart-define=API_HOST=$ApiHost"
Invoke-Expression $cmd

if ($LASTEXITCODE -eq 0) {
  $aabPath = "build\app\outputs\bundle\release\app-release.aab"
  Write-Host ""
  Write-Host "✓ Build succeeded!" -ForegroundColor Green
  Write-Host "Output: $aabPath" -ForegroundColor Green
  Write-Host ""
  Write-Host "Next: Upload to Play Console → Production → Create new release" -ForegroundColor Cyan
} else {
  Write-Host ""
  Write-Host "✗ Build failed!" -ForegroundColor Red
}
