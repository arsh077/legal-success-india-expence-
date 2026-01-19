import os
import datetime
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
    Fetch all expenses from Google Sheet.
    """
    try:
        sheet = get_google_sheet()
        if not sheet:
            return jsonify({'error': 'Could not connect to Google Sheets'}), 500
            
        records = sheet.get_all_records()
        # Ensure ID exists, if not generate one or use index
        formatted = []
        for i, row in enumerate(records):
            formatted.append({
                'id': str(i), # Using index as ID for simplicity
                'date': row.get('Date', ''),
                'amount': float(row.get('Amount', 0)) if row.get('Amount') else 0,
                'reason': row.get('Reason', ''),
                'timestamp': row.get('Timestamp', '')
            })
        return jsonify(formatted), 200
    except Exception as e:
        print(f"Error fetching expenses: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/add-expense', methods=['POST'])
def add_expense():
    """
    Add a new row to Google Sheet.
    Structure: Date | Amount | Reason | Timestamp
    """
    data = request.get_json()
    
    try:
        sheet = get_google_sheet()
        if not sheet:
            return jsonify({'error': 'Could not connect to Google Sheets'}), 500
        
        # Ensure the sheet has headers if it's empty
        if sheet.row_count == 0:
            sheet.append_row(['Date', 'Amount', 'Reason', 'Timestamp'])
        
        row_data = [
            data['date'],
            data['amount'],
            data['reason'],
            datetime.datetime.now().isoformat()
        ]
        
        sheet.append_row(row_data)
        
        return jsonify({'message': 'Expense added successfully', 'data': data}), 201
    except Exception as e:
        print(f"Error adding expense: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/expenses/<id>', methods=['DELETE'])
def delete_expense(id):
    """
    Delete an expense.
    NOTE: Using index logic for this simple app. 
    """
    try:
        sheet = get_google_sheet()
        if not sheet:
            return jsonify({'error': 'Could not connect to Google Sheets'}), 500
            
        # Row index logic:
        # gspread uses 1-based indexing.
        # Header is row 1. Data starts at row 2.
        # ID passed from frontend is the 0-based index of the data records.
        # So, Row to delete = (ID as int) + 2.
        row_to_delete = int(id) + 2
        
        # Verify if row exists (basic check)
        if row_to_delete > sheet.row_count:
             return jsonify({'error': 'Row not found'}), 404

        sheet.delete_rows(row_to_delete)
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