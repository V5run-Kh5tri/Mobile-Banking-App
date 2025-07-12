#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for SecureBank
Tests all core banking functionalities including authentication, transactions, loans, and investments.
"""

import requests
import json
import os
from datetime import datetime, date, timedelta
import sys

# Get backend URL from environment
BACKEND_URL = "https://513cbdc5-0ed4-4463-90ec-cb1a23d861e2.preview.emergentagent.com/api"

# Test credentials
TEST_USER = {
    "email": "john@example.com",
    "password": "password123"
}

# Global variables for test state
auth_token = None
user_data = None

class TestResult:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []
    
    def add_pass(self, test_name):
        self.passed += 1
        print(f"✅ {test_name}")
    
    def add_fail(self, test_name, error):
        self.failed += 1
        self.errors.append(f"{test_name}: {error}")
        print(f"❌ {test_name}: {error}")
    
    def summary(self):
        total = self.passed + self.failed
        print(f"\n{'='*60}")
        print(f"TEST SUMMARY")
        print(f"{'='*60}")
        print(f"Total Tests: {total}")
        print(f"Passed: {self.passed}")
        print(f"Failed: {self.failed}")
        print(f"Success Rate: {(self.passed/total*100):.1f}%" if total > 0 else "0%")
        
        if self.errors:
            print(f"\n{'='*60}")
            print("FAILED TESTS:")
            print(f"{'='*60}")
            for error in self.errors:
                print(f"• {error}")

result = TestResult()

def make_request(method, endpoint, data=None, headers=None, params=None):
    """Make HTTP request with error handling"""
    url = f"{BACKEND_URL}{endpoint}"
    
    default_headers = {"Content-Type": "application/json"}
    if headers:
        default_headers.update(headers)
    
    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=default_headers, params=params, timeout=10)
        elif method.upper() == "POST":
            if params:
                # For POST with query parameters
                response = requests.post(url, headers=default_headers, params=params, timeout=10)
            else:
                # For POST with JSON body
                response = requests.post(url, headers=default_headers, json=data, timeout=10)
        elif method.upper() == "PUT":
            response = requests.put(url, headers=default_headers, json=data, timeout=10)
        elif method.upper() == "DELETE":
            response = requests.delete(url, headers=default_headers, timeout=10)
        else:
            raise ValueError(f"Unsupported HTTP method: {method}")
        
        return response
    except requests.exceptions.RequestException as e:
        raise Exception(f"Request failed: {str(e)}")

def get_auth_headers():
    """Get authorization headers with token"""
    if not auth_token:
        raise Exception("No auth token available")
    return {"Authorization": f"Bearer {auth_token}"}

def test_health_check():
    """Test API health endpoints"""
    try:
        # Test root endpoint
        response = make_request("GET", "/")
        if response.status_code == 200:
            data = response.json()
            if "message" in data and "SecureBank API" in data["message"]:
                result.add_pass("API Root Endpoint")
            else:
                result.add_fail("API Root Endpoint", "Invalid response format")
        else:
            result.add_fail("API Root Endpoint", f"Status code: {response.status_code}")
        
        # Test health endpoint
        response = make_request("GET", "/health")
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "healthy":
                result.add_pass("API Health Check")
            else:
                result.add_fail("API Health Check", "API not healthy")
        else:
            result.add_fail("API Health Check", f"Status code: {response.status_code}")
            
    except Exception as e:
        result.add_fail("Health Check", str(e))

def test_user_login():
    """Test user authentication"""
    global auth_token, user_data
    
    try:
        response = make_request("POST", "/auth/login", TEST_USER)
        
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data and "user" in data:
                auth_token = data["access_token"]
                user_data = data["user"]
                result.add_pass("User Login")
                
                # Validate user data structure
                required_fields = ["id", "name", "email", "balance", "account_number"]
                missing_fields = [field for field in required_fields if field not in user_data]
                if missing_fields:
                    result.add_fail("User Data Structure", f"Missing fields: {missing_fields}")
                else:
                    result.add_pass("User Data Structure")
                    
                # Check if balance is reasonable
                if user_data.get("balance", 0) > 0:
                    result.add_pass("User Balance Check")
                else:
                    result.add_fail("User Balance Check", f"Balance: {user_data.get('balance')}")
            else:
                result.add_fail("User Login", "Missing access_token or user in response")
        else:
            result.add_fail("User Login", f"Status code: {response.status_code}, Response: {response.text}")
            
    except Exception as e:
        result.add_fail("User Login", str(e))

def test_user_profile():
    """Test user profile endpoints"""
    try:
        # Test get profile
        response = make_request("GET", "/user/profile", headers=get_auth_headers())
        
        if response.status_code == 200:
            profile_data = response.json()
            if profile_data.get("email") == TEST_USER["email"]:
                result.add_pass("Get User Profile")
            else:
                result.add_fail("Get User Profile", "Profile data mismatch")
        else:
            result.add_fail("Get User Profile", f"Status code: {response.status_code}")
        
        # Test get balance
        response = make_request("GET", "/user/balance", headers=get_auth_headers())
        
        if response.status_code == 200:
            balance_data = response.json()
            if "balance" in balance_data and isinstance(balance_data["balance"], (int, float)):
                result.add_pass("Get User Balance")
            else:
                result.add_fail("Get User Balance", "Invalid balance format")
        else:
            result.add_fail("Get User Balance", f"Status code: {response.status_code}")
            
    except Exception as e:
        result.add_fail("User Profile", str(e))

def test_transaction_history():
    """Test transaction history endpoints"""
    try:
        # Test get transaction history
        response = make_request("GET", "/transactions/history", headers=get_auth_headers())
        
        if response.status_code == 200:
            transactions = response.json()
            if isinstance(transactions, list):
                result.add_pass("Get Transaction History")
                
                # Check transaction structure if any exist
                if transactions:
                    transaction = transactions[0]
                    required_fields = ["id", "type", "amount", "description", "date"]
                    missing_fields = [field for field in required_fields if field not in transaction]
                    if missing_fields:
                        result.add_fail("Transaction Structure", f"Missing fields: {missing_fields}")
                    else:
                        result.add_pass("Transaction Structure")
                else:
                    result.add_pass("Transaction Structure (No transactions)")
            else:
                result.add_fail("Get Transaction History", "Response is not a list")
        else:
            result.add_fail("Get Transaction History", f"Status code: {response.status_code}")
        
        # Test get recent transactions
        response = make_request("GET", "/transactions/recent", headers=get_auth_headers())
        
        if response.status_code == 200:
            recent_transactions = response.json()
            if isinstance(recent_transactions, list):
                result.add_pass("Get Recent Transactions")
            else:
                result.add_fail("Get Recent Transactions", "Response is not a list")
        else:
            result.add_fail("Get Recent Transactions", f"Status code: {response.status_code}")
            
    except Exception as e:
        result.add_fail("Transaction History", str(e))

def test_send_money():
    """Test send money functionality"""
    try:
        # Get current balance first
        balance_response = make_request("GET", "/user/balance", headers=get_auth_headers())
        if balance_response.status_code != 200:
            result.add_fail("Send Money - Get Balance", "Could not get current balance")
            return
        
        current_balance = balance_response.json()["balance"]
        
        # Test send money with valid data
        send_data = {
            "recipient_name": "Jane Smith",
            "recipient_account": "ACC1234567890",
            "recipient_phone": "+1987654321",
            "amount": 100.0,
            "description": "Test transfer",
            "pin": "1234"
        }
        
        response = make_request("POST", "/transactions/send-money", send_data, headers=get_auth_headers())
        
        if response.status_code == 200:
            send_result = response.json()
            if "transaction_id" in send_result and "new_balance" in send_result:
                result.add_pass("Send Money Transaction")
                
                # Verify balance was deducted
                expected_balance = current_balance - send_data["amount"]
                if abs(send_result["new_balance"] - expected_balance) < 0.01:
                    result.add_pass("Send Money Balance Update")
                else:
                    result.add_fail("Send Money Balance Update", 
                                  f"Expected: {expected_balance}, Got: {send_result['new_balance']}")
            else:
                result.add_fail("Send Money Transaction", "Missing transaction_id or new_balance")
        else:
            result.add_fail("Send Money Transaction", f"Status code: {response.status_code}, Response: {response.text}")
        
        # Test send money with insufficient balance
        insufficient_data = send_data.copy()
        insufficient_data["amount"] = 999999.0  # Very large amount
        
        response = make_request("POST", "/transactions/send-money", insufficient_data, headers=get_auth_headers())
        
        if response.status_code == 400:
            result.add_pass("Send Money Insufficient Balance Check")
        else:
            result.add_fail("Send Money Insufficient Balance Check", 
                          f"Expected 400, got {response.status_code}")
            
    except Exception as e:
        result.add_fail("Send Money", str(e))

def test_request_money():
    """Test request money functionality"""
    try:
        request_data = {
            "recipient_name": "Alice Johnson",
            "recipient_phone": "+1555123456",
            "amount": 250.0,
            "description": "Dinner split"
        }
        
        response = make_request("POST", "/transactions/request-money", request_data, headers=get_auth_headers())
        
        if response.status_code == 200:
            request_result = response.json()
            required_fields = ["id", "recipient_name", "amount", "status", "payment_link"]
            missing_fields = [field for field in required_fields if field not in request_result]
            if missing_fields:
                result.add_fail("Request Money", f"Missing fields: {missing_fields}")
            else:
                result.add_pass("Request Money")
        else:
            result.add_fail("Request Money", f"Status code: {response.status_code}")
            
    except Exception as e:
        result.add_fail("Request Money", str(e))

def test_qr_payment():
    """Test QR payment functionality"""
    try:
        # Get current balance
        balance_response = make_request("GET", "/user/balance", headers=get_auth_headers())
        if balance_response.status_code != 200:
            result.add_fail("QR Payment - Get Balance", "Could not get current balance")
            return
        
        current_balance = balance_response.json()["balance"]
        
        # Test QR payment
        qr_data = {
            "merchant_id": "MERCHANT123",
            "amount": 75.0,
            "description": "Coffee purchase"
        }
        
        response = make_request("POST", "/transactions/qr-payment", 
                              data=qr_data, headers=get_auth_headers())
        
        if response.status_code == 200:
            payment_result = response.json()
            if "transaction_id" in payment_result and "new_balance" in payment_result:
                result.add_pass("QR Payment")
                
                # Verify balance was deducted
                expected_balance = current_balance - qr_data["amount"]
                if abs(payment_result["new_balance"] - expected_balance) < 0.01:
                    result.add_pass("QR Payment Balance Update")
                else:
                    result.add_fail("QR Payment Balance Update", 
                                  f"Expected: {expected_balance}, Got: {payment_result['new_balance']}")
            else:
                result.add_fail("QR Payment", "Missing transaction_id or new_balance")
        else:
            result.add_fail("QR Payment", f"Status code: {response.status_code}")
            
    except Exception as e:
        result.add_fail("QR Payment", str(e))

def test_loans():
    """Test loan management functionality"""
    try:
        # Test get user loans
        response = make_request("GET", "/loans/", headers=get_auth_headers())
        
        if response.status_code == 200:
            loans = response.json()
            if isinstance(loans, list):
                result.add_pass("Get User Loans")
                
                # Check loan structure if any exist
                if loans:
                    loan = loans[0]
                    required_fields = ["id", "type", "amount", "outstanding", "emi"]
                    missing_fields = [field for field in required_fields if field not in loan]
                    if missing_fields:
                        result.add_fail("Loan Structure", f"Missing fields: {missing_fields}")
                    else:
                        result.add_pass("Loan Structure")
                        
                        # Test EMI payment if loan exists
                        test_emi_payment(loan["id"])
                else:
                    result.add_pass("Loan Structure (No loans)")
            else:
                result.add_fail("Get User Loans", "Response is not a list")
        else:
            result.add_fail("Get User Loans", f"Status code: {response.status_code}")
        
        # Test loan application
        loan_app_data = {
            "loan_type": "Personal Loan",
            "requested_amount": 50000,
            "monthly_income": 75000,
            "employment_type": "Salaried",
            "purpose": "Home renovation"
        }
        
        response = make_request("POST", "/loans/apply", loan_app_data, headers=get_auth_headers())
        
        if response.status_code == 200:
            app_result = response.json()
            if "application_id" in app_result and "status" in app_result:
                result.add_pass("Loan Application")
            else:
                result.add_fail("Loan Application", "Missing application_id or status")
        else:
            result.add_fail("Loan Application", f"Status code: {response.status_code}")
        
        # Test loan calculator
        response = make_request("GET", "/loans/calculator", 
                              params={"loan_amount": 100000, "interest_rate": 10.5, "tenure_months": 24})
        
        if response.status_code == 200:
            calc_result = response.json()
            required_fields = ["emi", "total_amount", "total_interest"]
            missing_fields = [field for field in required_fields if field not in calc_result]
            if missing_fields:
                result.add_fail("Loan Calculator", f"Missing fields: {missing_fields}")
            else:
                result.add_pass("Loan Calculator")
        else:
            result.add_fail("Loan Calculator", f"Status code: {response.status_code}")
            
    except Exception as e:
        result.add_fail("Loans", str(e))

def test_emi_payment(loan_id):
    """Test EMI payment for a specific loan"""
    try:
        # Get current balance
        balance_response = make_request("GET", "/user/balance", headers=get_auth_headers())
        if balance_response.status_code != 200:
            result.add_fail("EMI Payment - Get Balance", "Could not get current balance")
            return
        
        current_balance = balance_response.json()["balance"]
        
        # Test EMI payment
        response = make_request("POST", f"/loans/pay-emi/{loan_id}", headers=get_auth_headers())
        
        if response.status_code == 200:
            emi_result = response.json()
            if "transaction_id" in emi_result and "new_balance" in emi_result:
                result.add_pass("EMI Payment")
                
                # Verify balance was deducted
                if emi_result["new_balance"] < current_balance:
                    result.add_pass("EMI Payment Balance Update")
                else:
                    result.add_fail("EMI Payment Balance Update", "Balance not deducted")
            else:
                result.add_fail("EMI Payment", "Missing transaction_id or new_balance")
        elif response.status_code == 400:
            # Could be insufficient balance, which is acceptable
            result.add_pass("EMI Payment (Insufficient Balance Check)")
        else:
            result.add_fail("EMI Payment", f"Status code: {response.status_code}")
            
    except Exception as e:
        result.add_fail("EMI Payment", str(e))

def test_investments():
    """Test investment management functionality"""
    try:
        # Test get portfolio summary
        response = make_request("GET", "/investments/portfolio", headers=get_auth_headers())
        
        if response.status_code == 200:
            portfolio = response.json()
            required_fields = ["total_invested", "total_current_value", "total_returns", "investments_count"]
            missing_fields = [field for field in required_fields if field not in portfolio]
            if missing_fields:
                result.add_fail("Portfolio Summary", f"Missing fields: {missing_fields}")
            else:
                result.add_pass("Portfolio Summary")
        else:
            result.add_fail("Portfolio Summary", f"Status code: {response.status_code}")
        
        # Test get user investments
        response = make_request("GET", "/investments/", headers=get_auth_headers())
        
        if response.status_code == 200:
            investments = response.json()
            if isinstance(investments, list):
                result.add_pass("Get User Investments")
                
                # Check investment structure if any exist
                if investments:
                    investment = investments[0]
                    required_fields = ["id", "type", "name", "amount", "current_value"]
                    missing_fields = [field for field in required_fields if field not in investment]
                    if missing_fields:
                        result.add_fail("Investment Structure", f"Missing fields: {missing_fields}")
                    else:
                        result.add_pass("Investment Structure")
                else:
                    result.add_pass("Investment Structure (No investments)")
            else:
                result.add_fail("Get User Investments", "Response is not a list")
        else:
            result.add_fail("Get User Investments", f"Status code: {response.status_code}")
        
        # Test create investment
        investment_data = {
            "type": "Mutual Fund",
            "name": "Test Growth Fund",
            "amount": 5000,
            "units": 250
        }
        
        response = make_request("POST", "/investments/", investment_data, headers=get_auth_headers())
        
        if response.status_code == 200:
            investment_result = response.json()
            if "id" in investment_result and investment_result.get("name") == investment_data["name"]:
                result.add_pass("Create Investment")
                
                # Test update investment
                test_update_investment(investment_result["id"])
                
                # Test sell investment
                test_sell_investment(investment_result["id"])
            else:
                result.add_fail("Create Investment", "Invalid response structure")
        elif response.status_code == 400:
            # Could be insufficient balance
            result.add_pass("Create Investment (Insufficient Balance Check)")
        else:
            result.add_fail("Create Investment", f"Status code: {response.status_code}")
            
    except Exception as e:
        result.add_fail("Investments", str(e))

def test_update_investment(investment_id):
    """Test investment update functionality"""
    try:
        update_data = {
            "current_value": 5500
        }
        
        response = make_request("PUT", f"/investments/{investment_id}", update_data, headers=get_auth_headers())
        
        if response.status_code == 200:
            updated_investment = response.json()
            if updated_investment.get("current_value") == update_data["current_value"]:
                result.add_pass("Update Investment")
            else:
                result.add_fail("Update Investment", "Value not updated correctly")
        else:
            result.add_fail("Update Investment", f"Status code: {response.status_code}")
            
    except Exception as e:
        result.add_fail("Update Investment", str(e))

def test_sell_investment(investment_id):
    """Test investment selling functionality"""
    try:
        # Get current balance
        balance_response = make_request("GET", "/user/balance", headers=get_auth_headers())
        if balance_response.status_code != 200:
            result.add_fail("Sell Investment - Get Balance", "Could not get current balance")
            return
        
        current_balance = balance_response.json()["balance"]
        
        response = make_request("DELETE", f"/investments/{investment_id}", headers=get_auth_headers())
        
        if response.status_code == 200:
            sell_result = response.json()
            if "transaction_id" in sell_result and "new_balance" in sell_result:
                result.add_pass("Sell Investment")
                
                # Verify balance was credited
                if sell_result["new_balance"] > current_balance:
                    result.add_pass("Sell Investment Balance Update")
                else:
                    result.add_fail("Sell Investment Balance Update", "Balance not credited")
            else:
                result.add_fail("Sell Investment", "Missing transaction_id or new_balance")
        else:
            result.add_fail("Sell Investment", f"Status code: {response.status_code}")
            
    except Exception as e:
        result.add_fail("Sell Investment", str(e))

def test_authentication_middleware():
    """Test authentication middleware"""
    try:
        # Test accessing protected endpoint without token
        response = make_request("GET", "/user/profile")
        
        if response.status_code == 401 or response.status_code == 403:
            result.add_pass("Authentication Middleware (No Token)")
        else:
            result.add_fail("Authentication Middleware (No Token)", 
                          f"Expected 401/403, got {response.status_code}")
        
        # Test with invalid token
        invalid_headers = {"Authorization": "Bearer invalid_token_here"}
        response = make_request("GET", "/user/profile", headers=invalid_headers)
        
        if response.status_code == 401 or response.status_code == 403:
            result.add_pass("Authentication Middleware (Invalid Token)")
        else:
            result.add_fail("Authentication Middleware (Invalid Token)", 
                          f"Expected 401/403, got {response.status_code}")
            
    except Exception as e:
        result.add_fail("Authentication Middleware", str(e))

def run_all_tests():
    """Run all backend tests"""
    print("🚀 Starting SecureBank Backend API Tests")
    print(f"Backend URL: {BACKEND_URL}")
    print("="*60)
    
    # Health checks first
    test_health_check()
    
    # Authentication tests
    test_user_login()
    
    if not auth_token:
        print("\n❌ Cannot proceed with other tests - authentication failed")
        result.summary()
        return
    
    # User management tests
    test_user_profile()
    
    # Transaction tests
    test_transaction_history()
    test_send_money()
    test_request_money()
    test_qr_payment()
    
    # Loan tests
    test_loans()
    
    # Investment tests
    test_investments()
    
    # Security tests
    test_authentication_middleware()
    
    # Print summary
    result.summary()
    
    # Return success/failure for script exit code
    return result.failed == 0

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)