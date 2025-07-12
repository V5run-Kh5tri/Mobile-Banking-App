from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import timedelta
from models.user import UserCreate, LoginRequest, LoginResponse
from services.auth import (
    authenticate_user, 
    create_user, 
    create_access_token, 
    get_current_user,
    user_to_response,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from database import get_database
from typing import Optional

router = APIRouter()
security = HTTPBearer()

@router.post("/signup", response_model=LoginResponse)
async def signup(user: UserCreate, db: AsyncIOMotorDatabase = Depends(get_database)):
    try:
        new_user = await create_user(db, user)
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": new_user.email}, expires_delta=access_token_expires
        )
        return LoginResponse(
            user=user_to_response(new_user.dict()),
            access_token=access_token
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )

@router.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest, db: AsyncIOMotorDatabase = Depends(get_database)):
    user = await authenticate_user(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    return LoginResponse(
        user=user_to_response(user),
        access_token=access_token
    )

@router.get("/me")
async def get_current_user_info(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user = await get_current_user(credentials.credentials, db)
    return user_to_response(user)

@router.post("/verify-otp")
async def verify_otp(otp: str, email: str):
    # Mock OTP verification - in real app, this would verify against stored OTP
    if len(otp) == 6 and otp.isdigit():
        return {"message": "OTP verified successfully", "verified": True}
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP"
        )