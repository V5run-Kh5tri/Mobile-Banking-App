from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional
from models.transaction import (
    Transaction, 
    TransactionCreate, 
    TransactionResponse, 
    SendMoneyRequest,
    RequestMoneyRequest,
    PaymentRequest,
    PaymentRequestResponse
)
from services.auth import get_current_user
from database import get_database
from datetime import datetime, timedelta
import uuid

router = APIRouter()
security = HTTPBearer()

@router.post("/send-money")
async def send_money(
    send_request: SendMoneyRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user = await get_current_user(credentials.credentials, db)
    
    # Validate PIN (mock validation)
    if len(send_request.pin) != 4 or not send_request.pin.isdigit():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid PIN"
        )
    
    # Check balance
    if user["balance"] < send_request.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient balance"
        )
    
    # Update sender's balance
    new_balance = user["balance"] - send_request.amount
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"balance": new_balance, "updated_at": datetime.utcnow()}}
    )
    
    # Create transaction record
    transaction = Transaction(
        user_id=user["id"],
        type="debit",
        amount=send_request.amount,
        description=f"Transfer to {send_request.recipient_name}",
        category="Transfer",
        recipient_name=send_request.recipient_name,
        recipient_account=send_request.recipient_account,
        recipient_phone=send_request.recipient_phone,
        balance_after=new_balance
    )
    
    await db.transactions.insert_one(transaction.dict())
    
    return {
        "message": "Money sent successfully",
        "transaction_id": transaction.id,
        "new_balance": new_balance
    }

@router.post("/request-money", response_model=PaymentRequestResponse)
async def request_money(
    request_data: RequestMoneyRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user = await get_current_user(credentials.credentials, db)
    
    # Create payment request
    payment_request = PaymentRequest(
        user_id=user["id"],
        recipient_name=request_data.recipient_name,
        recipient_phone=request_data.recipient_phone,
        amount=request_data.amount,
        description=request_data.description,
        expires_at=datetime.utcnow() + timedelta(days=7)
    )
    
    await db.payment_requests.insert_one(payment_request.dict())
    
    # Generate payment link
    payment_link = f"https://securebank.com/pay/{payment_request.id}"
    
    return PaymentRequestResponse(
        id=payment_request.id,
        recipient_name=payment_request.recipient_name,
        amount=payment_request.amount,
        description=payment_request.description,
        status=payment_request.status,
        created_at=payment_request.created_at,
        payment_link=payment_link
    )

@router.get("/history", response_model=List[TransactionResponse])
async def get_transaction_history(
    limit: Optional[int] = 50,
    category: Optional[str] = None,
    type: Optional[str] = None,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user = await get_current_user(credentials.credentials, db)
    
    # Build query
    query = {"user_id": user["id"]}
    if category:
        query["category"] = category
    if type:
        query["type"] = type
    
    # Get transactions
    transactions = await db.transactions.find(query).sort("date", -1).limit(limit).to_list(limit)
    
    return [
        TransactionResponse(
            id=t["id"],
            type=t["type"],
            amount=t["amount"],
            description=t["description"],
            category=t["category"],
            recipient_name=t.get("recipient_name"),
            recipient_account=t.get("recipient_account"),
            balance_after=t["balance_after"],
            date=t["date"],
            status=t["status"]
        ) for t in transactions
    ]

@router.get("/recent")
async def get_recent_transactions(
    limit: Optional[int] = 5,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user = await get_current_user(credentials.credentials, db)
    
    transactions = await db.transactions.find(
        {"user_id": user["id"]}
    ).sort("date", -1).limit(limit).to_list(limit)
    
    return [
        TransactionResponse(
            id=t["id"],
            type=t["type"],
            amount=t["amount"],
            description=t["description"],
            category=t["category"],
            recipient_name=t.get("recipient_name"),
            recipient_account=t.get("recipient_account"),
            balance_after=t["balance_after"],
            date=t["date"],
            status=t["status"]
        ) for t in transactions
    ]

@router.post("/qr-payment")
async def process_qr_payment(
    merchant_id: str,
    amount: float,
    description: str,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user = await get_current_user(credentials.credentials, db)
    
    # Check balance
    if user["balance"] < amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient balance"
        )
    
    # Update balance
    new_balance = user["balance"] - amount
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"balance": new_balance, "updated_at": datetime.utcnow()}}
    )
    
    # Create transaction
    transaction = Transaction(
        user_id=user["id"],
        type="debit",
        amount=amount,
        description=description,
        category="Payment",
        recipient_name=merchant_id,
        balance_after=new_balance
    )
    
    await db.transactions.insert_one(transaction.dict())
    
    return {
        "message": "Payment successful",
        "transaction_id": transaction.id,
        "new_balance": new_balance
    }