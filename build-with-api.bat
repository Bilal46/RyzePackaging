@echo off
REM Build script with API URL configuration
REM Usage: build-with-api.bat [API_URL]
REM Example: build-with-api.bat https://api.yourdomain.com/api

echo 🚀 Building with API Configuration...
echo.

if "%1"=="" (
    echo ⚠️  No API URL provided. Using default: http://localhost:3001/api
    echo.
    echo Usage: build-with-api.bat [API_URL]
    echo Example: build-with-api.bat https://api.yourdomain.com/api
    echo.
    set "API_URL=http://localhost:3001/api"
) else (
    set "API_URL=%1"
    echo ✅ Using API URL: %API_URL%
    echo.
)

REM Set environment variable and build
set "VITE_API_URL=%API_URL%"
call npm run build

if errorlevel 1 (
    echo.
    echo ❌ Build failed!
    exit /b 1
)

echo.
echo ✅ Build completed successfully!
echo.
echo 📋 Next Steps:
echo 1. Upload 'dist\' folder contents to cPanel public_html\
echo 2. Make sure backend API is deployed and running
echo 3. Test admin panel - changes should sync to frontend
echo.
echo 🔗 API URL used: %API_URL%
echo.

pause

