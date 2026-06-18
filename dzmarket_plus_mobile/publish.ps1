param(
  [string]$ApiHost = "",
  [string]$BuildType = "appbundle"
)

Write-Host "═══ DZ Market+ - Release Build ═══" -ForegroundColor Cyan
Write-Host ""

# Check keystore exists
$keystore = "android\upload-keystore.jks"
if (-not (Test-Path $keystore)) {
  Write-Host "ERROR: Keystore not found at $keystore" -ForegroundColor Red
  Write-Host "Generate one first with: keytool -genkey -v -keystore android\upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload"
  exit 1
}

# Check key.properties exists
if (-not (Test-Path "android\key.properties")) {
  Write-Host "ERROR: key.properties not found. Create it with:" -ForegroundColor Red
  Write-Host @"
storePassword=YOUR_PASSWORD
keyPassword=YOUR_PASSWORD
keyAlias=upload
storeFile=upload-keystore.jks
"@
  exit 1
}

# Clean previous builds
Write-Host "Cleaning previous builds..." -ForegroundColor Yellow
flutter clean 2>$null

# Get Flutter packages
Write-Host "Getting packages..." -ForegroundColor Yellow
flutter pub get 2>$null

# Build command
$cmd = "flutter build $BuildType --release"
if ($ApiHost) {
  # If host doesn't include protocol, assume HTTPS for production
  if ($ApiHost -notmatch '^https?://') {
    $ApiHost = "https://$ApiHost"
  }
  $cmd += " --dart-define=API_HOST=$ApiHost"
  Write-Host "Using production API host: $ApiHost" -ForegroundColor Green
} else {
  Write-Host "WARNING: No API_HOST set. App will use default (127.0.0.1:3000)." -ForegroundColor Yellow
  Write-Host "Pass -ApiHost your-server.com to set a production server." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Building: $cmd" -ForegroundColor Cyan
Write-Host ""

# Run build
Invoke-Expression $cmd

if ($LASTEXITCODE -eq 0) {
  Write-Host ""
  Write-Host "✓ Build succeeded!" -ForegroundColor Green
  if ($BuildType -eq "appbundle") {
    Write-Host "Output: build\app\outputs\bundle\release\app-release.aab" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Go to https://play.google.com/console" -ForegroundColor White
    Write-Host "  2. Create a new app or select existing" -ForegroundColor White
    Write-Host "  3. Go to Production > Release > Create new release" -ForegroundColor White
    Write-Host "  4. Upload the .aab file above" -ForegroundColor White
    Write-Host "  5. Fill in release notes and roll out" -ForegroundColor White
  } else {
    Write-Host "Output: build\app\outputs\flutter-apk\app-release.apk" -ForegroundColor Green
  }
} else {
  Write-Host ""
  Write-Host "✗ Build failed!" -ForegroundColor Red
}
