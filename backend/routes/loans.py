from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from models.loan import Loan, LoanCreate, LoanResponse, LoanApplication, LoanApplicationCreate, EMIPayment
from services.auth import get_current_user
from database import get_database
from datetime import datetime, date
import calendar

router = APIRouter()
security = HTTPBearer()

@router.get("/", response_model=List[LoanResponse])
async def get_user_loans(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user = await get_current_user(credentials.credentials, db)
    
    loans = await db.loans.find({"user_id": user["id"], "status": "active"}).to_list(100)
    
    return [
        LoanResponse(
            id=loan["id"],
            type=loan["type"],
            amount=loan["amount"],
            outstanding=loan["outstanding"],
            emi=loan["emi"],
            interest_rate=loan["interest_rate"],
            tenure=loan["tenure"],
            remaining_months=loan["remaining_months"],
            next_due_date=loan["next_due_date"],
            status=loan["status"],
            created_at=loan["created_at"]
        ) for loan in loans
    ]

@router.post("/apply", response_model=dict)
async def apply_for_loan(
    loan_app: LoanApplicationCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user = await get_current_user(credentials.credentials, db)
    
    # Create loan application
    application = LoanApplication(
        user_id=user["id"],
        loan_type=loan_app.loan_type,
        requested_amount=loan_app.requested_amount,
        monthly_income=loan_app.monthly_income,
        employment_type=loan_app.employment_type,
        purpose=loan_app.purpose
    )
    
    await db.loan_applications.insert_one(application.dict())
    
    return {
        "message": "Loan application submitted successfully",
        "application_id": application.id,
        "status": "pending"
    }

@router.post("/pay-emi/{loan_id}")
async def pay_emi(
    loan_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user = await get_current_user(credentials.credentials, db)
    
    # Get loan details
    loan = await db.loans.find_one({"id": loan_id, "user_id": user["id"]})
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan not found"
        )
    
    # Check if user has sufficient balance
    if user["balance"] < loan["emi"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient balance for EMI payment"
        )
    
    # Update user balance
    new_balance = user["balance"] - loan["emi"]
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"balance": new_balance, "updated_at": datetime.utcnow()}}
    )
    
    # Calculate new loan details
    new_outstanding = loan["outstanding"] - loan["emi"]
    new_remaining_months = loan["remaining_months"] - 1
    
    # Calculate next due date (add 1 month)
    current_due = loan["next_due_date"]
    if isinstance(current_due, str):
        current_due = datetime.strptime(current_due, "%Y-%m-%d").date()
    
    next_month = current_due.month + 1
    next_year = current_due.year
    if next_month > 12:
        next_month = 1
        next_year += 1
    
    next_due_date = date(next_year, next_month, current_due.day)
    
    # Update loan
    await db.loans.update_one(
        {"id": loan_id},
        {"$set": {
            "outstanding": max(0, new_outstanding),
            "remaining_months": max(0, new_remaining_months),
            "next_due_date": next_due_date,
            "status": "closed" if new_outstanding <= 0 else "active"
        }}
    )
    
    # Create EMI payment record
    emi_payment = EMIPayment(
        loan_id=loan_id,
        user_id=user["id"],
        amount=loan["emi"],
        due_date=current_due
    )
    
    await db.emi_payments.insert_one(emi_payment.dict())
    
    # Create transaction record
    from models.transaction import Transaction
    transaction = Transaction(
        user_id=user["id"],
        type="debit",
        amount=loan["emi"],
        description=f"EMI Payment - {loan['type']}",
        category="EMI",
        balance_after=new_balance
    )
    
    await db.transactions.insert_one(transaction.dict())
    
    return {
        "message": "EMI paid successfully",
        "transaction_id": transaction.id,
        "new_balance": new_balance,
        "remaining_amount": max(0, new_outstanding)
    }

@router.get("/calculator")
async def calculate_emi(
    loan_amount: float,
    interest_rate: float,
    tenure_months: int
):
    # Calculate EMI using the formula: EMI = [P * r * (1 + r)^n] / [(1 + r)^n - 1]
    # Where P = Principal, r = Monthly interest rate, n = Number of months
    
    monthly_rate = interest_rate / (12 * 100)
    emi = (loan_amount * monthly_rate * (1 + monthly_rate)**tenure_months) / ((1 + monthly_rate)**tenure_months - 1)
    
    total_amount = emi * tenure_months
    total_interest = total_amount - loan_amount
    
    return {
        "loan_amount": loan_amount,
        "interest_rate": interest_rate,
        "tenure_months": tenure_months,
        "emi": round(emi, 2),
        "total_amount": round(total_amount, 2),
        "total_interest": round(total_interest, 2)
    }