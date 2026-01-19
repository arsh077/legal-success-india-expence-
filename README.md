# Legal Success India - Expense Tracker

A modern expense tracking application built with React (Frontend) and Flask (Backend) that integrates with Google Sheets for data storage.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- Google Account for Sheets API

### 1. Clone and Setup
```bash
git clone https://github.com/arsh077/legal-success-india-expence-.git
cd legal-success-india-expence-
```

### 2. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt
```

### 3. Google Sheets Setup

1. **Create Google Cloud Project:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project or select existing
   - Enable Google Sheets API and Google Drive API

2. **Create Service Account:**
   - Go to "IAM & Admin" > "Service Accounts"
   - Create service account named "expense-tracker-service"
   - Generate JSON key and save as `backend/service_account.json`

3. **Share Your Sheet:**
   - Open: https://docs.google.com/spreadsheets/d/1AS47TuW3ShC9TA8eYB_nWVG0uOPNzvN6BNZAGvlWSbI/edit
   - Share with service account email (from JSON file)
   - Give "Editor" permissions

4. **Set Sheet Headers:**
   Ensure first row has: `Date | Amount | Reason | Timestamp`

### 4. Run Application

**Option A - Automatic (Windows):**
```bash
start.bat
```

**Option B - Manual:**

Terminal 1 (Backend):
```bash
cd backend
python app.py
```

Terminal 2 (Frontend):
```bash
npm run dev
```

### 5. Access Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

## 🔐 Login Credentials

- **Email:** arshad@legalsuccessindia.com
- **Password:** Khurshid@1997

## 📊 Features

- ✅ Secure login authentication
- ✅ Add/Delete expenses
- ✅ Real-time Google Sheets integration
- ✅ Responsive design with dark mode
- ✅ Dashboard with expense analytics
- ✅ Modern UI with animations

## 🛠️ Tech Stack

**Frontend:**
- React 19 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Lucide React for icons
- Recharts for analytics

**Backend:**
- Flask (Python)
- Google Sheets API
- CORS enabled for development

## 📁 Project Structure

```
├── components/          # React components
├── services/           # API services
├── backend/           # Flask backend
├── types.ts          # TypeScript definitions
└── README.md         # This file
```

## 🔧 Configuration

The application connects to your Google Sheet:
- **Sheet ID:** `1AS47TuW3ShC9TA8eYB_nWVG0uOPNzvN6BNZAGvlWSbI`
- **Backend URL:** `http://localhost:5000/api`

## 📝 API Endpoints

- `POST /api/login` - User authentication
- `GET /api/expenses` - Fetch all expenses
- `POST /api/add-expense` - Add new expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/health` - Health check

## 🚨 Troubleshooting

**Backend Issues:**
- Ensure `service_account.json` exists in `backend/` folder
- Check Google Sheet is shared with service account
- Verify Python dependencies are installed

**Frontend Issues:**
- Run `npm install` to ensure dependencies
- Check backend is running on port 5000
- Verify CORS is enabled in Flask

**Google Sheets Issues:**
- Ensure APIs are enabled in Google Cloud Console
- Check service account has Editor permissions
- Verify sheet headers match expected format

## 📞 Support

For issues or questions, contact: arshad@legalsuccessindia.com

---

Built with ❤️ for Legal Success India