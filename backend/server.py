from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path
import os
import logging

# Import routes
from routes.auth import router as auth_router
from routes.user import router as user_router
from routes.transactions import router as transactions_router
from routes.loans import router as loans_router
from routes.investments import router as investments_router
from database import init_database, close_database

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create the main app
app = FastAPI(title="SecureBank API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(user_router, prefix="/user", tags=["User"])
api_router.include_router(transactions_router, prefix="/transactions", tags=["Transactions"])
api_router.include_router(loans_router, prefix="/loans", tags=["Loans"])
api_router.include_router(investments_router, prefix="/investments", tags=["Investments"])

# Add a simple health check endpoint
@api_router.get("/")
async def root():
    return {"message": "SecureBank API is running", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "SecureBank API"}

# Include the API router in the main app
app.include_router(api_router)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    await init_database()
    logger.info("SecureBank API started successfully")

@app.on_event("shutdown")
async def shutdown_event():
    await close_database()
    logger.info("SecureBank API shutdown complete")