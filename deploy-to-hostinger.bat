@echo off
echo Building production version...
call npm run build

echo.
echo Production build complete!
echo.
echo Files to upload to Hostinger:
echo ================================
dir dist /b

echo.
echo Upload these files from the 'dist' folder to your Hostinger public_html directory:
echo 1. Go to Hostinger File Manager
echo 2. Navigate to public_html
echo 3. Delete old files (backup first)
echo 4. Upload all files from 'dist' folder
echo 5. Test at: https://expense.legalsuccessindia.com
echo.
pause