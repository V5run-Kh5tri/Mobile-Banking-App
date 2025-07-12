import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, Send, Download, QrCode, Clock, Plus, Minus } from 'lucide-react';

const Transactions = () => {
  const navigate = useNavigate();

  const transactionOptions = [
    {
      icon: Send,
      title: 'Send Money',
      description: 'Transfer funds to any account',
      path: '/send-money',
      color: 'bg-blue-500'
    },
    {
      icon: Download,
      title: 'Request Money',
      description: 'Request payment from someone',
      path: '/request-money',
      color: 'bg-green-500'
    },
    {
      icon: QrCode,
      title: 'QR Scanner',
      description: 'Scan QR code to pay',
      path: '/qr-scanner',
      color: 'bg-purple-500'
    },
    {
      icon: Clock,
      title: 'Transaction History',
      description: 'View all your transactions',
      path: '/transaction-history',
      color: 'bg-orange-500'
    }
  ];

  const quickAmounts = [500, 1000, 2000, 5000];

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">Transactions</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        {/* Transaction Options */}
        <div className="space-y-4 mb-8">
          {transactionOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <Card
                key={index}
                className="bg-white border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => navigate(option.path)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl ${option.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{option.title}</h3>
                      <p className="text-sm text-gray-500">{option.description}</p>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-600 text-sm">›</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Send */}
        <Card className="bg-white border-gray-200 mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Quick Send</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  className="h-14 flex flex-col items-center justify-center space-y-1 bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                  onClick={() => navigate('/send-money', { state: { amount } })}
                >
                  <Plus className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">${amount}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Recipients */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Recent Recipients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-gray-500 py-8">
              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No recent recipients</p>
              <p className="text-sm">Send money to see recipients here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Transactions;