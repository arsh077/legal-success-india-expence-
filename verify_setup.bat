@echo off
echo Legal Success India Expense Tracker - Setup Verification
echo =========================================================
echo.

echo Checking Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js found

echo.
echo Checking Python installation...
python --version
if %errorlevel% neq 0 (
    echo ❌ Python not found! Please install Python from https://python.org/
    pause
    exit /b 1
)
echo ✅ Python found

echo.
echo Checking frontend dependencies...
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)
echo ✅ Frontend dependencies ready

echo.
echo Checking backend dependencies...
cd backend
if not exist "service_account.json" (
    echo ⚠️  service_account.json not found!
    echo Please follow the Google Sheets setup guide in setup_google_sheets.md
    echo.
)

echo Installing backend dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed

echo.
echo Testing backend API...
python test_api.py

echo.
echo Setup verification complete!
echo.
echo To start the application:
echo 1. Run: start.bat (automatic)
echo 2. Or manually start backend and frontend in separate terminals
echo.
pause