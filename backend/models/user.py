from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
import uuid

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: str
    password: str
    account_number: str = Field(default_factory=lambda: f"ACC{str(uuid.uuid4().int)[:10]}")
    ifsc_code: str = "BANK0001234"
    balance: float = 10000.0
    account_type: str = "Savings"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    account_number: str
    ifsc_code: str
    balance: float
    account_type: str
    created_at: datetime
    is_active: bool

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    user: UserResponse
    access_token: str
    token_type: str = "bearer"