@echo off
echo Installing Python dependencies for Legal Success India Expense Tracker...
pip install -r requirements.txt
echo.
echo Installation complete!
echo.
echo Next steps:
echo 1. Set up Google Sheets API credentials (see setup_google_sheets.md)
echo 2. Run: python app.py
pause