@echo off
echo 🚀 Pushing Period Tracker to GitHub...
echo.

REM Step 1: Check if we're in the right directory
if not exist "src\config\firebase.js" (
    echo ❌ ERROR: firebase.js not found!
    echo Please run this from the period-tracker-main directory
    pause
    exit /b 1
)

echo ✅ Found firebase.js - in correct directory

REM Step 2: Try to initialize git if not already done
git status >nul 2>&1
if %errorlevel% neq 0 (
    echo 📁 Initializing Git repository...
    git init
)

REM Step 3: Add remote origin
echo 🔗 Adding remote origin...
git remote add origin https://github.com/smitbahadure1/luna.git

REM Step 4: Add all files
echo 📋 Adding all files to git...
git add .

REM Step 5: Commit changes
echo 💾 Committing changes...
git commit -m "Complete period tracker app with Firebase integration and admin panel"

REM Step 6: Push to GitHub
echo 🚀 Pushing to GitHub...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ✅ SUCCESS! Code pushed to GitHub repository!
    echo 🌐 Repository: https://github.com/smitbahadure1/luna
    echo 📱 Your app is now ready for APK build!
) else (
    echo.
    echo ❌ FAILED! Could not push to GitHub.
    echo Please check the error messages above.
)

echo.
pause
