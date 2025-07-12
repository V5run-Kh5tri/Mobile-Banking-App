export const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    phone: '+1234567890',
    accountNumber: 'ACC1234567890',
    ifscCode: 'BANK0001234',
    balance: 45750.50,
    accountType: 'Savings',
    createdAt: '2024-01-15T10:30:00Z'
  }
];

export const mockTransactions = [
  {
    id: '1',
    type: 'credit',
    amount: 2500,
    description: 'Salary Credit',
    date: '2024-01-15T09:00:00Z',
    balance: 45750.50,
    category: 'Income'
  },
  {
    id: '2',
    type: 'debit',
    amount: 150,
    description: 'Grocery Store',
    date: '2024-01-14T18:30:00Z',
    balance: 43250.50,
    category: 'Shopping'
  },
  {
    id: '3',
    type: 'debit',
    amount: 50,
    description: 'Coffee Shop',
    date: '2024-01-14T14:15:00Z',
    balance: 43400.50,
    category: 'Food'
  },
  {
    id: '4',
    type: 'credit',
    amount: 1000,
    description: 'Freelance Payment',
    date: '2024-01-13T16:45:00Z',
    balance: 43450.50,
    category: 'Income'
  },
  {
    id: '5',
    type: 'debit',
    amount: 300,
    description: 'Electric Bill',
    date: '2024-01-12T12:00:00Z',
    balance: 42450.50,
    category: 'Bills'
  },
  {
    id: '6',
    type: 'debit',
    amount: 80,
    description: 'Gas Station',
    date: '2024-01-11T19:20:00Z',
    balance: 42750.50,
    category: 'Transport'
  },
  {
    id: '7',
    type: 'credit',
    amount: 200,
    description: 'Cashback Reward',
    date: '2024-01-10T11:30:00Z',
    balance: 42830.50,
    category: 'Rewards'
  },
  {
    id: '8',
    type: 'debit',
    amount: 1200,
    description: 'Rent Payment',
    date: '2024-01-09T10:00:00Z',
    balance: 42630.50,
    category: 'Housing'
  }
];

export const mockLoans = [
  {
    id: '1',
    type: 'Home Loan',
    amount: 500000,
    outstanding: 425000,
    emi: 3500,
    nextDueDate: '2024-02-01',
    interestRate: 8.5,
    tenure: 240,
    remainingMonths: 180
  },
  {
    id: '2',
    type: 'Personal Loan',
    amount: 100000,
    outstanding: 65000,
    emi: 2200,
    nextDueDate: '2024-01-25',
    interestRate: 12.5,
    tenure: 60,
    remainingMonths: 30
  }
];

export const mockInvestments = [
  {
    id: '1',
    type: 'Mutual Fund',
    name: 'Equity Growth Fund',
    amount: 50000,
    currentValue: 58500,
    returns: 8500,
    returnsPercent: 17.0,
    units: 2340.5
  },
  {
    id: '2',
    type: 'Fixed Deposit',
    name: 'FD - 1 Year',
    amount: 25000,
    currentValue: 27000,
    returns: 2000,
    returnsPercent: 8.0,
    maturityDate: '2024-06-15'
  },
  {
    id: '3',
    type: 'Stocks',
    name: 'Tech Stocks Portfolio',
    amount: 30000,
    currentValue: 35600,
    returns: 5600,
    returnsPercent: 18.7,
    units: 150
  }
];

export const mockRecentContacts = [
  {
    id: '1',
    name: 'Alice Johnson',
    accountNumber: 'ACC9876543210',
    phone: '+1234567891',
    avatar: 'AJ'
  },
  {
    id: '2',
    name: 'Bob Smith',
    accountNumber: 'ACC5432109876',
    phone: '+1234567892',
    avatar: 'BS'
  },
  {
    id: '3',
    name: 'Carol Williams',
    accountNumber: 'ACC1357924680',
    phone: '+1234567893',
    avatar: 'CW'
  },
  {
    id: '4',
    name: 'David Brown',
    accountNumber: 'ACC2468013579',
    phone: '+1234567894',
    avatar: 'DB'
  }
];