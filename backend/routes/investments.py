from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from models.investment import Investment, InvestmentCreate, InvestmentResponse, InvestmentUpdate, PortfolioSummary
from services.auth import get_current_user
from database import get_database
from datetime import datetime
import random

router = APIRouter()
security = HTTPBearer()

@router.get("/portfolio", response_model=PortfolioSummary)
async def get_portfolio_summary(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user = await get_current_user(credentials.credentials, db)
    
    investments = await db.investments.find({"user_id": user["id"], "status": "active"}).to_list(100)
    
    if not investments:
        return PortfolioSummary(
            total_invested=0,
            total_current_value=0,
            total_returns=0,
            total_returns_percent=0,
            investments_count=0
        )
    
    total_invested = sum(inv["amount"] for inv in investments)
    total_current_value = sum(inv["current_value"] for inv in investments)
    total_returns = total_current_value - total_invested
    total_returns_percent = (total_returns / total_invested * 100) if total_invested > 0 else 0
    
    return PortfolioSummary(
        total_invested=total_invested,
        total_current_value=total_current_value,
        total_returns=total_returns,
        total_returns_percent=round(total_returns_percent, 2),
        investments_count=len(investments)
    )

@router.get("/", response_model=List[InvestmentResponse])
async def get_user_investments(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user = await get_current_user(credentials.credentials, db)
    
    investments = await db.investments.find({"user_id": user["id"], "status": "active"}).to_list(100)
    
    return [
        InvestmentResponse(
            id=inv["id"],
            type=inv["type"],
            name=inv["name"],
            amount=inv["amount"],
            current_value=inv["current_value"],
            returns=inv["returns"],
            returns_percent=inv["returns_percent"],
            units=inv.get("units"),
            maturity_date=inv.get("maturity_date"),
            status=inv["status"],
            created_at=inv["created_at"]
        ) for inv in investments
    ]

@router.post("/", response_model=InvestmentResponse)
async def create_investment(
    investment_data: InvestmentCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user = await get_current_user(credentials.credentials, db)
    
    # Check if user has sufficient balance
    if user["balance"] < investment_data.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient balance for investment"
        )
    
    # Update user balance
    new_balance = user["balance"] - investment_data.amount
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"balance": new_balance, "updated_at": datetime.utcnow()}}
    )
    
    # Create investment with mock current value (slightly higher than invested amount)
    returns_percent = random.uniform(5, 20)  # Mock returns between 5-20%
    current_value = investment_data.amount * (1 + returns_percent / 100)
    returns = current_value - investment_data.amount
    
    investment = Investment(
        user_id=user["id"],
        type=investment_data.type,
        name=investment_data.name,
        amount=investment_data.amount,
        current_value=current_value,
        returns=returns,
        returns_percent=returns_percent,
        units=investment_data.units,
        maturity_date=investment_data.maturity_date
    )
    
    await db.investments.insert_one(investment.dict())
    
    # Create transaction record
    from models.transaction import Transaction
    transaction = Transaction(
        user_id=user["id"],
        type="debit",
        amount=investment_data.amount,
        description=f"Investment in {investment_data.name}",
        category="Investment",
        balance_after=new_balance
    )
    
    await db.transactions.insert_one(transaction.dict())
    
    return InvestmentResponse(
        id=investment.id,
        type=investment.type,
        name=investment.name,
        amount=investment.amount,
        current_value=investment.current_value,
        returns=investment.returns,
        returns_percent=investment.returns_percent,
        units=investment.units,
        maturity_date=investment.maturity_date,
        status=investment.status,
        created_at=investment.created_at
    )

@router.put("/{investment_id}", response_model=InvestmentResponse)
async def update_investment(
    investment_id: str,
    investment_update: InvestmentUpdate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user = await get_current_user(credentials.credentials, db)
    
    # Get investment
    investment = await db.investments.find_one({"id": investment_id, "user_id": user["id"]})
    if not investment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investment not found"
        )
    
    # Prepare update data
    update_data = {}
    if investment_update.current_value is not None:
        update_data["current_value"] = investment_update.current_value
        update_data["returns"] = investment_update.current_value - investment["amount"]
        update_data["returns_percent"] = (update_data["returns"] / investment["amount"]) * 100
    
    if investment_update.returns is not None:
        update_data["returns"] = investment_update.returns
        update_data["current_value"] = investment["amount"] + investment_update.returns
        update_data["returns_percent"] = (investment_update.returns / investment["amount"]) * 100
    
    if investment_update.returns_percent is not None:
        update_data["returns_percent"] = investment_update.returns_percent
        update_data["returns"] = investment["amount"] * (investment_update.returns_percent / 100)
        update_data["current_value"] = investment["amount"] + update_data["returns"]
    
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await db.investments.update_one(
            {"id": investment_id},
            {"$set": update_data}
        )
    
    # Get updated investment
    updated_investment = await db.investments.find_one({"id": investment_id})
    
    return InvestmentResponse(
        id=updated_investment["id"],
        type=updated_investment["type"],
        name=updated_investment["name"],
        amount=updated_investment["amount"],
        current_value=updated_investment["current_value"],
        returns=updated_investment["returns"],
        returns_percent=updated_investment["returns_percent"],
        units=updated_investment.get("units"),
        maturity_date=updated_investment.get("maturity_date"),
        status=updated_investment["status"],
        created_at=updated_investment["created_at"]
    )

@router.delete("/{investment_id}")
async def sell_investment(
    investment_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user = await get_current_user(credentials.credentials, db)
    
    # Get investment
    investment = await db.investments.find_one({"id": investment_id, "user_id": user["id"]})
    if not investment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investment not found"
        )
    
    # Update user balance with current value
    new_balance = user["balance"] + investment["current_value"]
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"balance": new_balance, "updated_at": datetime.utcnow()}}
    )
    
    # Mark investment as sold
    await db.investments.update_one(
        {"id": investment_id},
        {"$set": {"status": "sold", "updated_at": datetime.utcnow()}}
    )
    
    # Create transaction record
    from models.transaction import Transaction
    transaction = Transaction(
        user_id=user["id"],
        type="credit",
        amount=investment["current_value"],
        description=f"Investment sold - {investment['name']}",
        category="Investment",
        balance_after=new_balance
    )
    
    await db.transactions.insert_one(transaction.dict())
    
    return {
        "message": "Investment sold successfully",
        "transaction_id": transaction.id,
        "amount_received": investment["current_value"],
        "new_balance": new_balance
    }