import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BottomNavigation from './BottomNavigation';
import Dashboard from './Dashboard';
import Transactions from './Transactions';
import Loans from './Loans';
import Investments from './Investments';
import Profile from './Profile';
import SendMoney from './SendMoney';
import RequestMoney from './RequestMoney';
import QRScanner from './QRScanner';
import TransactionHistory from './TransactionHistory';

const MainApp = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-sm mx-auto bg-white min-h-screen relative">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/investments" element={<Investments />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/send-money" element={<SendMoney />} />
          <Route path="/request-money" element={<RequestMoney />} />
          <Route path="/qr-scanner" element={<QRScanner />} />
          <Route path="/transaction-history" element={<TransactionHistory />} />
        </Routes>
        <BottomNavigation />
      </div>
    </div>
  );
};

export default MainApp;