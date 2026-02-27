Write-Host "Starting manual fix for Android Build (Attempt 6)..."

# 1. Build Cleanup
Set-Location android
Write-Host "Cleaning build..."
./gradlew clean
Set-Location ..

# 2. Bundle JS Manually
Write-Host "Bundling JavaScript manually..."
$assetsDir = "android\app\src\main\assets"
if (!(Test-Path $assetsDir)) { New-Item -ItemType Directory -Path $assetsDir -Force | Out-Null }

cmd /c "npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res"

if ($LASTEXITCODE -ne 0) { 
    Write-Error "Bundle failed!"
    exit 1 
}

# 3. Cleanup corrupt icon if it exists
$corruptIcon = "android\app\src\main\res\drawable-mdpi\assets_icon.png"
if (Test-Path $corruptIcon) {
    Remove-Item $corruptIcon -Force
    Write-Host "Removed potentially corrupt icon: $corruptIcon"
}

# 4. Assemble Release
Set-Location android
Write-Host "Assembling Release APK..."
./gradlew assembleRelease

if ($LASTEXITCODE -ne 0) { 
    Write-Error "Assemble failed!"
    exit 1 
}

# 5. Success
$apkPath = "app\build\outputs\apk\release\app-release.apk"
$destPath = "$env:USERPROFILE\Desktop\app-release-fixed.apk"
if (Test-Path $apkPath) {
    Copy-Item $apkPath $destPath -Force
    Write-Host "SUCCESS! APK copied to Desktop: $destPath"
}
else {
    Write-Error "APK not found at expected path: $apkPath"
}
