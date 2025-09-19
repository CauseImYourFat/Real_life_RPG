@echo off
echo.
echo 🌐 Real-Life RPG - Web Hosting Deployment Prep
echo.
echo This script prepares the files for static web hosting...
echo.

:: Copy the static version as the main index
copy "index-static.html" "index.html" /Y

echo ✅ Prepared index.html for static hosting
echo.
echo 📁 Files ready for upload:
echo - index.html (static version)
echo - dist/bundle.js
echo - image/ folder
echo.
echo 🚀 UPLOAD INSTRUCTIONS:
echo 1. Upload all files to your web hosting provider
echo 2. Make sure index.html is set as your main page
echo 3. The app will work completely offline!
echo.
echo 💡 No server setup required on web host
echo 💾 All data saved in browser localStorage
echo 🔄 Works across browser sessions
echo.
pause
