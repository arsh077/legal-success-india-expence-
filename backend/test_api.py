#!/usr/bin/env python3
"""
Simple test script to verify the API endpoints are working
"""
import requests
import json

BASE_URL = "http://localhost:5000/api"

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Health Check: {response.status_code} - {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health Check Failed: {e}")
        return False

def test_login():
    """Test login endpoint"""
    try:
        data = {
            "email": "arshad@legalsuccessindia.com",
            "password": "Khurshid@1997"
        }
        response = requests.post(f"{BASE_URL}/login", json=data)
        print(f"Login Test: {response.status_code} - {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Login Test Failed: {e}")
        return False

def test_invalid_login():
    """Test invalid login"""
    try:
        data = {
            "email": "wrong@email.com",
            "password": "wrongpassword"
        }
        response = requests.post(f"{BASE_URL}/login", json=data)
        print(f"Invalid Login Test: {response.status_code} - {response.json()}")
        return response.status_code == 401
    except Exception as e:
        print(f"Invalid Login Test Failed: {e}")
        return False

def test_expenses():
    """Test expenses endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/expenses")
        print(f"Get Expenses: {response.status_code}")
        if response.status_code == 200:
            expenses = response.json()
            print(f"Found {len(expenses)} expenses")
        else:
            print(f"Error: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Get Expenses Failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing Legal Success India Expense Tracker API...")
    print("=" * 50)
    
    tests = [
        ("Health Check", test_health),
        ("Valid Login", test_login),
        ("Invalid Login", test_invalid_login),
        ("Get Expenses", test_expenses),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🧪 Running {test_name}...")
        if test_func():
            print(f"✅ {test_name} PASSED")
            passed += 1
        else:
            print(f"❌ {test_name} FAILED")
    
    print(f"\n{'='*50}")
    print(f"Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! API is working correctly.")
    else:
        print("⚠️  Some tests failed. Check your setup.")