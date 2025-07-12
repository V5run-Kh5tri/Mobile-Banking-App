import asyncio
from datetime import datetime, date, timedelta
from database import get_database
from models.user import User
from models.transaction import Transaction
from models.loan import Loan
from models.investment import Investment
from services.auth import get_password_hash

async def seed_database():
    """Seed the database with sample data"""
    db = await get_database()
    
    # Check if data already exists
    existing_user = await db.users.find_one({"email": "john@example.com"})
    if existing_user:
        print("Sample data already exists. Skipping seed.")
        return
    
    # Create sample user
    sample_user = User(
        name="John Doe",
        email="john@example.com",
        phone="+1234567890",
        password=get_password_hash("password123"),
        balance=45750.50
    )
    
    await db.users.insert_one(sample_user.dict())
    print(f"Created user: {sample_user.email}")
    
    # Create sample transactions
    sample_transactions = [
        Transaction(
            user_id=sample_user.id,
            type="credit",
            amount=2500,
            description="Salary Credit",
            category="Income",
            balance_after=45750.50,
            date=datetime.utcnow() - timedelta(days=1)
        ),
        Transaction(
            user_id=sample_user.id,
            type="debit",
            amount=150,
            description="Grocery Store",
            category="Shopping",
            balance_after=43250.50,
            date=datetime.utcnow() - timedelta(days=2)
        ),
        Transaction(
            user_id=sample_user.id,
            type="debit",
            amount=50,
            description="Coffee Shop",
            category="Food",
            balance_after=43400.50,
            date=datetime.utcnow() - timedelta(days=3)
        ),
        Transaction(
            user_id=sample_user.id,
            type="credit",
            amount=1000,
            description="Freelance Payment",
            category="Income",
            balance_after=43450.50,
            date=datetime.utcnow() - timedelta(days=4)
        ),
        Transaction(
            user_id=sample_user.id,
            type="debit",
            amount=300,
            description="Electric Bill",
            category="Bills",
            balance_after=42450.50,
            date=datetime.utcnow() - timedelta(days=5)
        )
    ]
    
    for transaction in sample_transactions:
        await db.transactions.insert_one(transaction.dict())
    
    print(f"Created {len(sample_transactions)} sample transactions")
    
    # Create sample loans
    sample_loans = [
        Loan(
            user_id=sample_user.id,
            type="Home Loan",
            amount=500000,
            outstanding=425000,
            emi=3500,
            interest_rate=8.5,
            tenure=240,
            remaining_months=180,
            next_due_date=date.today() + timedelta(days=15)
        ),
        Loan(
            user_id=sample_user.id,
            type="Personal Loan",
            amount=100000,
            outstanding=65000,
            emi=2200,
            interest_rate=12.5,
            tenure=60,
            remaining_months=30,
            next_due_date=date.today() + timedelta(days=10)
        )
    ]
    
    for loan in sample_loans:
        await db.loans.insert_one(loan.dict())
    
    print(f"Created {len(sample_loans)} sample loans")
    
    # Create sample investments
    sample_investments = [
        Investment(
            user_id=sample_user.id,
            type="Mutual Fund",
            name="Equity Growth Fund",
            amount=50000,
            current_value=58500,
            returns=8500,
            returns_percent=17.0,
            units=2340.5
        ),
        Investment(
            user_id=sample_user.id,
            type="Fixed Deposit",
            name="FD - 1 Year",
            amount=25000,
            current_value=27000,
            returns=2000,
            returns_percent=8.0,
            maturity_date=date.today() + timedelta(days=180)
        ),
        Investment(
            user_id=sample_user.id,
            type="Stocks",
            name="Tech Stocks Portfolio",
            amount=30000,
            current_value=35600,
            returns=5600,
            returns_percent=18.7,
            units=150
        )
    ]
    
    for investment in sample_investments:
        await db.investments.insert_one(investment.dict())
    
    print(f"Created {len(sample_investments)} sample investments")
    
    print("Database seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_database())