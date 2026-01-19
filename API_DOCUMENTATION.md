# 📊 Legal Success India Expense Tracker - API Documentation

## 🚀 Download & Export Features

### Base URL: `http://localhost:5000/api`

---

## 📥 **Download Endpoints**

### 1. **Download All Expenses**
```
GET /api/download/all
```
**Description:** Download all expenses from all time periods as CSV  
**Response:** CSV file with all expense data  
**Filename:** `Legal_Success_India_All_Expenses_YYYYMMDD.csv`

**CSV Format:**
```csv
Date,Amount (₹),Reason,Timestamp
2026-01-19,1500.0,Office Supplies,2026-01-19T14:44:06.668914
2025-12-15,2500.0,Client Meeting,2026-01-19T14:44:41.084324
```

### 2. **Download Monthly Expenses**
```
GET /api/download/monthly/{year}/{month}
```
**Parameters:**
- `year`: 4-digit year (e.g., 2026)
- `month`: Month number 1-12 (e.g., 1 for January)

**Example:** `/api/download/monthly/2026/1`

**Description:** Download expenses for a specific month with summary  
**Response:** CSV file with monthly data and statistics  
**Filename:** `Legal_Success_India_January_2026_Expenses.csv`

**CSV Format:**
```csv
Legal Success India - Monthly Expense Report - January 2026

Date,Amount (₹),Reason,Timestamp
2026-01-19,1500.0,Office Supplies,2026-01-19T14:44:06.668914

Summary
Total Transactions,1
Total Amount (₹),1500.0
Average per Transaction (₹),1500.0
```

### 3. **Get Available Months**
```
GET /api/months
```
**Description:** Get list of months that have expense data  
**Response:** JSON array of month objects

**Response Format:**
```json
[
  {
    "key": "2026-01",
    "name": "January 2026",
    "year": 2026,
    "month": 1,
    "count": 1,
    "total": 1500.0
  }
]
```

---

## 🎯 **Frontend Integration**

### Download Modal Component
- **Location:** `components/DownloadModal.tsx`
- **Trigger:** Click "Export" or "Reports" buttons in Dashboard
- **Features:**
  - Download all expenses
  - Download by specific month
  - View monthly summaries
  - Progress indicators
  - Success/error notifications

### Dashboard Integration
- **Export Button:** Total Transactions card
- **Reports Button:** Monthly Summary card
- **Modal:** Opens download options

---

## 💡 **Usage Examples**

### JavaScript/Frontend
```javascript
// Download all expenses
const downloadAll = async () => {
  const response = await fetch('http://localhost:5000/api/download/all');
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'expenses.csv';
  a.click();
};

// Get available months
const getMonths = async () => {
  const response = await fetch('http://localhost:5000/api/months');
  const months = await response.json();
  return months;
};

// Download monthly report
const downloadMonth = async (year, month) => {
  const response = await fetch(`http://localhost:5000/api/download/monthly/${year}/${month}`);
  const blob = await response.blob();
  // Handle download...
};
```

### cURL Examples
```bash
# Download all expenses
curl -o "all_expenses.csv" "http://localhost:5000/api/download/all"

# Download January 2026 expenses
curl -o "jan_2026.csv" "http://localhost:5000/api/download/monthly/2026/1"

# Get available months
curl "http://localhost:5000/api/months"
```

---

## 📋 **CSV File Features**

### All Expenses CSV:
- ✅ Complete transaction history
- ✅ Date, Amount, Reason, Timestamp
- ✅ Ready for Excel/Google Sheets
- ✅ UTF-8 encoding with ₹ symbol

### Monthly Report CSV:
- ✅ Month-specific data
- ✅ Summary statistics
- ✅ Total transactions count
- ✅ Total amount
- ✅ Average per transaction
- ✅ Professional header with company name

---

## 🔧 **Technical Details**

**File Format:** CSV (Comma Separated Values)  
**Encoding:** UTF-8  
**Content-Type:** `text/csv`  
**Download Method:** Browser download via blob  
**Storage:** Local JSON backup + Google Sheets (when available)  

---

## 🎉 **Benefits**

1. **📊 Easy Reporting:** Generate monthly/yearly reports
2. **📈 Data Analysis:** Import into Excel/Google Sheets
3. **💼 Professional:** Formatted for business use
4. **🔄 Backup:** Export data for safekeeping
5. **📱 Accessible:** Works on all devices
6. **⚡ Fast:** Instant CSV generation
7. **🎯 Flexible:** All data or specific months

---

**Perfect for Legal Success India's expense management and reporting needs!** 🏛️⚖️