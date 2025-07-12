import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE_URL = `${BACKEND_URL}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('bankingUser');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  signup: (userData) => 
    api.post('/auth/signup', userData),
  
  verifyOTP: (otp, email) => 
    api.post('/auth/verify-otp', { otp, email }),
  
  getCurrentUser: () => 
    api.get('/auth/me'),
};

// User API
export const userAPI = {
  getProfile: () => 
    api.get('/user/profile'),
  
  updateProfile: (userData) => 
    api.put('/user/profile', userData),
  
  getBalance: () => 
    api.get('/user/balance'),
  
  updateBalance: (amount) => 
    api.post('/user/update-balance', { amount }),
};

// Transaction API
export const transactionAPI = {
  sendMoney: (sendData) => 
    api.post('/transactions/send-money', sendData),
  
  requestMoney: (requestData) => 
    api.post('/transactions/request-money', requestData),
  
  getHistory: (params = {}) => 
    api.get('/transactions/history', { params }),
  
  getRecent: (limit = 5) => 
    api.get('/transactions/recent', { params: { limit } }),
  
  processQRPayment: (paymentData) => 
    api.post('/transactions/qr-payment', paymentData),
};

// Loan API
export const loanAPI = {
  getLoans: () => 
    api.get('/loans'),
  
  applyForLoan: (loanData) => 
    api.post('/loans/apply', loanData),
  
  payEMI: (loanId) => 
    api.post(`/loans/pay-emi/${loanId}`),
  
  calculateEMI: (loanAmount, interestRate, tenureMonths) => 
    api.get('/loans/calculator', { 
      params: { loan_amount: loanAmount, interest_rate: interestRate, tenure_months: tenureMonths } 
    }),
};

// Investment API
export const investmentAPI = {
  getPortfolioSummary: () => 
    api.get('/investments/portfolio'),
  
  getInvestments: () => 
    api.get('/investments'),
  
  createInvestment: (investmentData) => 
    api.post('/investments', investmentData),
  
  updateInvestment: (investmentId, updateData) => 
    api.put(`/investments/${investmentId}`, updateData),
  
  sellInvestment: (investmentId) => 
    api.delete(`/investments/${investmentId}`),
};

export default api;