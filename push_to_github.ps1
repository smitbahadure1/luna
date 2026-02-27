# 🚀 Push Period Tracker to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "src\config\firebase.js")) {
    Write-Host "❌ ERROR: firebase.js not found!" -ForegroundColor Red
    Write-Host "Please run this from the period-tracker-main directory" -ForegroundColor Yellow
    Read-Host "Press any key to exit..." -ForegroundColor Cyan
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host "✅ Found firebase.js - in correct directory" -ForegroundColor Green

# Initialize Git if not already done
$gitStatus = git status 2>$null
if ($gitStatus -match "not a git repository") {
    Write-Host "📁 Initializing Git repository..." -ForegroundColor Cyan
    git init
    git remote add origin https://github.com/smitbahadure1/luna.git
}

# Add all files
Write-Host "📋 Adding all files to Git..." -ForegroundColor Cyan
git add .

# Commit changes
Write-Host "💾 Committing changes..." -ForegroundColor Cyan
git commit -m "Complete period tracker app with Firebase integration and admin panel"

# Push to GitHub
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Cyan
git push -u origin main

# Check result
if ($LASTEXITCODE -eq 0) {
    Write-Host "" -ForegroundColor Green
    Write-Host "✅ SUCCESS! Code pushed to GitHub repository!" -ForegroundColor Green
    Write-Host "🌐 Repository: https://github.com/smitbahadure1/luna" -ForegroundColor Green
    Write-Host "📱 Your app is now ready for APK build!" -ForegroundColor Green
    Write-Host "" -ForegroundColor Green
    Write-Host "🎯 Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Build APK: npx eas build --platform android --profile preview" -ForegroundColor White
    Write-Host "2. Test on device via USB debugging" -ForegroundColor White
    Write-Host "3. Deploy to app stores when ready" -ForegroundColor White
} else {
    Write-Host "" -ForegroundColor Red
    Write-Host "❌ FAILED! Could not push to GitHub." -ForegroundColor Red
    Write-Host "Please check the error messages above." -ForegroundColor Red
    Write-Host "" -ForegroundColor Red
}

Write-Host "Press any key to exit..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
