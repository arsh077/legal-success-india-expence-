@echo off
echo Starting Legal Success India Expense Tracker...
echo.

echo Installing frontend dependencies...
call npm install

echo.
echo Starting backend server...
start cmd /k "cd backend && python app.py"

echo.
echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo Starting frontend development server...
start cmd /k "npm run dev"

echo.
echo Application is starting...
echo Frontend: http://localhost:5173
echo Backend: http://localhost:5000
echo.
echo Press any key to exit...
pause > nul