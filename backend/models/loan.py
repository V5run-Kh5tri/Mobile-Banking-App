from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
import uuid

class Loan(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: str  # "Home Loan", "Personal Loan", "Car Loan", "Education Loan"
    amount: float
    outstanding: float
    emi: float
    interest_rate: float
    tenure: int  # in months
    remaining_months: int
    next_due_date: date
    status: str = "active"  # "active", "closed", "defaulted"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class LoanCreate(BaseModel):
    type: str
    amount: float
    interest_rate: float
    tenure: int

class LoanResponse(BaseModel):
    id: str
    type: str
    amount: float
    outstanding: float
    emi: float
    interest_rate: float
    tenure: int
    remaining_months: int
    next_due_date: date
    status: str
    created_at: datetime

class LoanApplication(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    loan_type: str
    requested_amount: float
    monthly_income: float
    employment_type: str
    purpose: str
    status: str = "pending"  # "pending", "approved", "rejected"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class LoanApplicationCreate(BaseModel):
    loan_type: str
    requested_amount: float
    monthly_income: float
    employment_type: str
    purpose: str

class EMIPayment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    loan_id: str
    user_id: str
    amount: float
    payment_date: datetime = Field(default_factory=datetime.utcnow)
    due_date: date
    status: str = "completed"