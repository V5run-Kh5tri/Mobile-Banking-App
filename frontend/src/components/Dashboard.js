import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { transactionAPI } from '../services/api';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { 
  Send, 
  Download, 
  QrCode, 
  Eye, 
  EyeOff, 
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Bell,
  Settings
} from 'lucide-react';

const Dashboard = () => {
  const { user, refreshUserData } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentTransactions();
  }, []);

  const loadRecentTransactions = async () => {
    try {
      const response = await transactionAPI.getRecent(3);
      setRecentTransactions(response.data);
    } catch (error) {
      console.error('Failed to load recent transactions:', error);
      addToast('Failed to load recent transactions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { icon: Send, label: 'Send Money', path: '/send-money', color: 'bg-blue-500' },
    { icon: Download, label: 'Request Money', path: '/request-money', color: 'bg-green-500' },
    { icon: QrCode, label: 'QR Scanner', path: '/qr-scanner', color: 'bg-purple-500' },
    { icon: Clock, label: 'History', path: '/transaction-history', color: 'bg-orange-500' }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-b-3xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-lg font-semibold">Welcome back,</h1>
            <p className="text-xl font-bold">{user?.name || 'User'}</p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={() => addToast('Notifications feature coming soon!', 'info')}
            >
              <Bell className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={() => navigate('/profile')}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Balance Card */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm opacity-90">Total Balance</p>
                <div className="flex items-center space-x-2">
                  <span className="text-3xl font-bold">
                    {showBalance ? formatCurrency(user?.balance || 0) : '••••••••'}
                  </span>
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="text-white/70 hover:text-white"
                  >
                    {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="text-sm opacity-90">
              <p>Account: {user?.account_number}</p>
              <p>IFSC: {user?.ifsc_code}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="px-6 py-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2 bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                onClick={() => navigate(action.path)}
              >
                <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700"
            onClick={() => navigate('/transaction-history')}
          >
            View All
          </Button>
        </div>
        
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-white border-gray-200">
                <CardContent className="p-4">
                  <div className="animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recentTransactions.length === 0 ? (
          <Card className="bg-white border-gray-200">
            <CardContent className="p-8 text-center">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No recent transactions</p>
              <p className="text-sm text-gray-500 mt-1">Your transactions will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <Card key={transaction.id} className="bg-white border-gray-200 hover:shadow-md transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'credit' ? (
                          <ArrowDownLeft className="w-5 h-5 text-green-600" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;