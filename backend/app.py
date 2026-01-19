import os
import datetime
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import gspread
from google.oauth2.service_account import Credentials
from functools import wraps

# Setup Flask App
app = Flask(__name__)
# Allow CORS for development (adjust origin in production)
CORS(app, resources={r"/api/*": {"origins": "*"}})
bcrypt = Bcrypt(app)

# Configuration
# The Sheet ID provided by user
SHEET_ID = '1AS47TuW3ShC9TA8eYB_nWVG0uOPNzvN6BNZAGvlWSbI' 

# Valid credentials provided by user
users_db = {
    'arshad@legalsuccessindia.com': 'Khurshid@1997'
}

# Local storage file for expenses when Google Sheets is not available
LOCAL_EXPENSES_FILE = 'expenses_backup.json'

# --- Local Storage Functions ---
def load_local_expenses():
    """Load expenses from local JSON file"""
    try:
        if os.path.exists(LOCAL_EXPENSES_FILE):
            with open(LOCAL_EXPENSES_FILE, 'r') as f:
                return json.load(f)
        return []
    except Exception as e:
        print(f"Error loading local expenses: {e}")
        return []

def save_local_expenses(expenses):
    """Save expenses to local JSON file"""
    try:
        with open(LOCAL_EXPENSES_FILE, 'w') as f:
            json.dump(expenses, f, indent=2)
        return True
    except Exception as e:
        print(f"Error saving local expenses: {e}")
        return False

# --- Google Sheets Setup ---
def get_google_sheet():
    """
    Connect to Google Sheets using service account credentials.
    """
    try:
        # Try to use service account if available
        if os.path.exists('service_account.json'):
            scope = [
                "https://spreadsheets.google.com/feeds",
                "https://www.googleapis.com/auth/drive"
            ]
            creds = Credentials.from_service_account_file('service_account.json', scopes=scope)
            client = gspread.authorize(creds)
        else:
            # Fallback: Use anonymous access for public sheets (limited functionality)
            print("Warning: No service account found. You need to set up Google Sheets API credentials.")
            return None
            
        sheet = client.open_by_key(SHEET_ID).sheet1
        return sheet
    except Exception as e:
        print(f"Error connecting to Google Sheets: {e}")
        return None

# --- Auth Middleware ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # In a real app, check 'Authorization' header
        # For this demo code, we skip actual validation logic
        return f(*args, **kwargs)
    return decorated

# --- Routes ---

@app.route('/api/login', methods=['POST'])
def login():
    """
    Handle user login.
    Verify email and password.
    """
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Check credentials against our user database
    if email in users_db and users_db[email] == password:
        return jsonify({
            'message': 'Login successful',
            'token': 'simulated-jwt-token',
            'name': 'Arshad Khan',
            'email': email
        }), 200
    
    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    """
    Fetch all expenses from Google Sheet or local storage.
    """
    try:
        sheet = get_google_sheet()
        if sheet:
            # Try to get from Google Sheets
            records = sheet.get_all_records()
            formatted = []
            for i, row in enumerate(records):
                formatted.append({
                    'id': str(i),
                    'date': row.get('Date', ''),
                    'amount': float(row.get('Amount', 0)) if row.get('Amount') else 0,
                    'reason': row.get('Reason', ''),
                    'timestamp': row.get('Timestamp', '')
                })
            return jsonify(formatted), 200
        else:
            # Fallback to local storage
            print("Using local storage for expenses")
            expenses = load_local_expenses()
            return jsonify(expenses), 200
            
    except Exception as e:
        print(f"Error fetching expenses from Google Sheets, using local storage: {e}")
        # Fallback to local storage
        expenses = load_local_expenses()
        return jsonify(expenses), 200

@app.route('/api/add-expense', methods=['POST'])
def add_expense():
    """
    Add a new expense to Google Sheet or local storage.
    """
    data = request.get_json()
    
    # Create expense object
    expense = {
        'id': str(len(load_local_expenses())),  # Simple ID generation
        'date': data['date'],
        'amount': float(data['amount']),
        'reason': data['reason'],
        'timestamp': datetime.datetime.now().isoformat()
    }
    
    try:
        sheet = get_google_sheet()
        if sheet:
            # Try to add to Google Sheets
            if sheet.row_count == 0:
                sheet.append_row(['Date', 'Amount', 'Reason', 'Timestamp'])
            
            row_data = [
                expense['date'],
                expense['amount'],
                expense['reason'],
                expense['timestamp']
            ]
            sheet.append_row(row_data)
            print("Expense added to Google Sheets")
        else:
            print("Google Sheets not available, using local storage")
        
        # Always save to local storage as backup
        expenses = load_local_expenses()
        expenses.append(expense)
        save_local_expenses(expenses)
        
        return jsonify({'message': 'Expense added successfully', 'data': expense}), 201
        
    except Exception as e:
        print(f"Error adding to Google Sheets, saved locally: {e}")
        # Save to local storage as fallback
        expenses = load_local_expenses()
        expenses.append(expense)
        if save_local_expenses(expenses):
            return jsonify({'message': 'Expense saved locally (Google Sheets unavailable)', 'data': expense}), 201
        else:
            return jsonify({'error': 'Failed to save expense'}), 500

@app.route('/api/expenses/<id>', methods=['DELETE'])
def delete_expense(id):
    """
    Delete an expense from Google Sheet and local storage.
    """
    try:
        # Delete from local storage
        expenses = load_local_expenses()
        expenses = [exp for exp in expenses if exp['id'] != id]
        save_local_expenses(expenses)
        
        # Try to delete from Google Sheets if available
        sheet = get_google_sheet()
        if sheet:
            try:
                row_to_delete = int(id) + 2  # Header is row 1, data starts at row 2
                if row_to_delete <= sheet.row_count:
                    sheet.delete_rows(row_to_delete)
                    print("Expense deleted from Google Sheets")
            except Exception as e:
                print(f"Could not delete from Google Sheets: {e}")
        
        return jsonify({'message': 'Expense deleted successfully'}), 200
        
    except Exception as e:
        print(f"Error deleting expense: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Legal Success India Expense Tracker API'}), 200

if __name__ == '__main__':
    print("Starting Legal Success India Expense Tracker API...")
    print("Make sure to set up your Google Sheets service account credentials!")
    app.run(debug=True, port=5000, host='0.0.0.0')