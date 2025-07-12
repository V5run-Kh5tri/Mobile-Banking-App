from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

class Transaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: str  # "credit" or "debit"
    amount: float
    description: str
    category: str
    recipient_name: Optional[str] = None
    recipient_account: Optional[str] = None
    recipient_phone: Optional[str] = None
    balance_after: float
    date: datetime = Field(default_factory=datetime.utcnow)
    status: str = "completed"  # "pending", "completed", "failed"

class TransactionCreate(BaseModel):
    type: str
    amount: float
    description: str
    category: str
    recipient_name: Optional[str] = None
    recipient_account: Optional[str] = None
    recipient_phone: Optional[str] = None

class TransactionResponse(BaseModel):
    id: str
    type: str
    amount: float
    description: str
    category: str
    recipient_name: Optional[str] = None
    recipient_account: Optional[str] = None
    balance_after: float
    date: datetime
    status: str

class SendMoneyRequest(BaseModel):
    recipient_name: str
    recipient_account: str
    recipient_phone: Optional[str] = None
    amount: float
    description: Optional[str] = None
    pin: str

class RequestMoneyRequest(BaseModel):
    recipient_name: str
    recipient_phone: Optional[str] = None
    amount: float
    description: Optional[str] = None

class PaymentRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    recipient_name: str
    recipient_phone: Optional[str] = None
    amount: float
    description: Optional[str] = None
    status: str = "pending"  # "pending", "completed", "cancelled"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime

class PaymentRequestResponse(BaseModel):
    id: str
    recipient_name: str
    amount: float
    description: Optional[str] = None
    status: str
    created_at: datetime
    payment_link: str