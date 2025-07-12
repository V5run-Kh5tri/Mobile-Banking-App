from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.user import UserUpdate, UserResponse
from services.auth import get_current_user, user_to_response
from database import get_database
from datetime import datetime

router = APIRouter()
security = HTTPBearer()

@router.get("/profile", response_model=UserResponse)
async def get_profile(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user = await get_current_user(credentials.credentials, db)
    return user_to_response(user)

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    user_update: UserUpdate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    current_user = await get_current_user(credentials.credentials, db)
    
    # Prepare update data
    update_data = {}
    if user_update.name is not None:
        update_data["name"] = user_update.name
    if user_update.email is not None:
        update_data["email"] = user_update.email
    if user_update.phone is not None:
        update_data["phone"] = user_update.phone
    
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await db.users.update_one(
            {"id": current_user["id"]},
            {"$set": update_data}
        )
    
    # Get updated user
    updated_user = await db.users.find_one({"id": current_user["id"]})
    return user_to_response(updated_user)

@router.get("/balance")
async def get_balance(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user = await get_current_user(credentials.credentials, db)
    return {"balance": user["balance"]}

@router.post("/update-balance")
async def update_balance(
    amount: float,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user = await get_current_user(credentials.credentials, db)
    new_balance = user["balance"] + amount
    
    if new_balance < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient balance"
        )
    
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"balance": new_balance, "updated_at": datetime.utcnow()}}
    )
    
    return {"balance": new_balance, "message": "Balance updated successfully"}