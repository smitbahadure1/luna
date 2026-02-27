Write-Host "Starting Fresh Android Build..."

Set-Location android

Write-Host "Cleaning..."
./gradlew clean

Write-Host "Building Release APK..."
./gradlew assembleRelease

if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed!"
    exit 1
}

# Copy to Desktop
$apkPath = "app\build\outputs\apk\release\app-release.apk"
$destPath = "$env:USERPROFILE\Desktop\app-release-final.apk"
if (Test-Path $apkPath) {
    Copy-Item $apkPath $destPath -Force
    Write-Host "SUCCESS! APK copied to Desktop: $destPath"
}
else {
    Write-Error "APK not found at expected path: $apkPath"
}
