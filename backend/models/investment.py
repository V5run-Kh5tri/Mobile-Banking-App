from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
import uuid

class Investment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: str  # "Mutual Fund", "Fixed Deposit", "Stocks", "Bonds"
    name: str
    amount: float  # invested amount
    current_value: float
    returns: float
    returns_percent: float
    units: Optional[float] = None
    maturity_date: Optional[date] = None
    status: str = "active"  # "active", "matured", "sold"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class InvestmentCreate(BaseModel):
    type: str
    name: str
    amount: float
    units: Optional[float] = None
    maturity_date: Optional[date] = None

class InvestmentResponse(BaseModel):
    id: str
    type: str
    name: str
    amount: float
    current_value: float
    returns: float
    returns_percent: float
    units: Optional[float] = None
    maturity_date: Optional[date] = None
    status: str
    created_at: datetime

class InvestmentUpdate(BaseModel):
    current_value: Optional[float] = None
    returns: Optional[float] = None
    returns_percent: Optional[float] = None

class PortfolioSummary(BaseModel):
    total_invested: float
    total_current_value: float
    total_returns: float
    total_returns_percent: float
    investments_count: int