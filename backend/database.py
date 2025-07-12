from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGO_URL = os.environ.get('MONGO_URL')
DB_NAME = os.environ.get('DB_NAME', 'banking_app')

client = AsyncIOMotorClient(MONGO_URL)
database = client[DB_NAME]

async def get_database():
    return database

# Initialize collections
async def init_database():
    """Initialize database with indexes and sample data"""
    db = database
    
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("account_number", unique=True)
    await db.transactions.create_index([("user_id", 1), ("date", -1)])
    await db.loans.create_index([("user_id", 1), ("status", 1)])
    await db.investments.create_index([("user_id", 1), ("status", 1)])
    await db.payment_requests.create_index([("user_id", 1), ("status", 1)])
    await db.loan_applications.create_index([("user_id", 1), ("status", 1)])
    
    print("Database initialized with indexes")

# Close database connection
async def close_database():
    client.close()