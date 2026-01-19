# Google Sheets API Setup Guide

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API and Google Drive API

## Step 2: Create Service Account

1. Go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Give it a name like "expense-tracker-service"
4. Click "Create and Continue"
5. Skip role assignment for now
6. Click "Done"

## Step 3: Generate Credentials

1. Click on your newly created service account
2. Go to "Keys" tab
3. Click "Add Key" > "Create New Key"
4. Choose "JSON" format
5. Download the file and rename it to `service_account.json`
6. Place it in the `backend/` folder

## Step 4: Share Your Google Sheet

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1AS47TuW3ShC9TA8eYB_nWVG0uOPNzvN6BNZAGvlWSbI/edit
2. Click "Share" button
3. Add the service account email (found in the JSON file, looks like: `expense-tracker-service@your-project.iam.gserviceaccount.com`)
4. Give it "Editor" permissions
5. Click "Send"

## Step 5: Set Up Sheet Headers

Make sure your Google Sheet has these column headers in the first row:
- Date
- Amount  
- Reason
- Timestamp

## Step 6: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

## Step 7: Run the Backend

```bash
python app.py
```

Your backend will be available at http://localhost:5000