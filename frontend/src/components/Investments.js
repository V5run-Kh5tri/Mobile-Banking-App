import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, Plus, TrendingUp, TrendingDown, DollarSign, Calendar, PieChart } from 'lucide-react';
import { mockInvestments } from '../data/mockData';

const Investments = () => {
  const navigate = useNavigate();
  const [selectedInvestment, setSelectedInvestment] = useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTotalInvestment = () => {
    return mockInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  };

  const getTotalCurrentValue = () => {
    return mockInvestments.reduce((sum, inv) => sum + inv.currentValue, 0);
  };

  const getTotalReturns = () => {
    return mockInvestments.reduce((sum, inv) => sum + inv.returns, 0);
  };

  const getTotalReturnsPercent = () => {
    const totalInvested = getTotalInvestment();
    const totalReturns = getTotalReturns();
    return totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;
  };

  const getInvestmentTypeIcon = (type) => {
    switch (type) {
      case 'Mutual Fund':
        return <PieChart className="w-5 h-5" />;
      case 'Fixed Deposit':
        return <DollarSign className="w-5 h-5" />;
      case 'Stocks':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <TrendingUp className="w-5 h-5" />;
    }
  };

  const getInvestmentTypeColor = (type) => {
    switch (type) {
      case 'Mutual Fund':
        return 'bg-purple-100 text-purple-600';
      case 'Fixed Deposit':
        return 'bg-green-100 text-green-600';
      case 'Stocks':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">Investments</h1>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setSelectedInvestment('new')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Invest
          </Button>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Portfolio Summary */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white mb-6">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <h2 className="text-lg font-semibold mb-2">Portfolio Value</h2>
              <p className="text-3xl font-bold">{formatCurrency(getTotalCurrentValue())}</p>
              <div className="flex items-center justify-center mt-2">
                {getTotalReturnsPercent() >= 0 ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                <span className="text-sm">
                  {getTotalReturnsPercent() >= 0 ? '+' : ''}{getTotalReturnsPercent().toFixed(2)}%
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm opacity-90">Total Invested</p>
                <p className="text-lg font-semibold">{formatCurrency(getTotalInvestment())}</p>
              </div>
              <div>
                <p className="text-sm opacity-90">Total Returns</p>
                <p className="text-lg font-semibold">{formatCurrency(getTotalReturns())}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Investment Options */}
        {selectedInvestment === 'new' && (
          <Card className="bg-white border-gray-200 mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Investment Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { type: 'Mutual Funds', risk: 'Moderate', returns: '12-15%', min: '$500' },
                  { type: 'Fixed Deposits', risk: 'Low', returns: '6-8%', min: '$1,000' },
                  { type: 'Stocks', risk: 'High', returns: '15-25%', min: '$100' },
                  { type: 'Bonds', risk: 'Low', returns: '4-6%', min: '$1,000' }
                ].map((option, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{option.type}</h4>
                        <p className="text-sm text-gray-600">Min: {option.min}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded ${
                          option.risk === 'Low' ? 'bg-green-100 text-green-800' :
                          option.risk === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {option.risk} Risk
                        </span>
                        <p className="text-sm font-medium text-green-600 mt-1">{option.returns}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedInvestment(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    setSelectedInvestment(null);
                    alert('Investment feature coming soon!');
                  }}
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Investments */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Investments</h2>
          
          {mockInvestments.map((investment) => (
            <Card key={investment.id} className="bg-white border-gray-200 hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getInvestmentTypeColor(investment.type)}`}>
                      {getInvestmentTypeIcon(investment.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{investment.name}</h3>
                      <p className="text-sm text-gray-500">{investment.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(investment.currentValue)}
                    </p>
                    <div className="flex items-center">
                      {investment.returnsPercent >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${
                        investment.returnsPercent >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {investment.returnsPercent >= 0 ? '+' : ''}{investment.returnsPercent}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-sm text-gray-600">Invested</p>
                    <p className="font-medium">{formatCurrency(investment.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Returns</p>
                    <p className={`font-medium ${
                      investment.returns >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {investment.returns >= 0 ? '+' : ''}{formatCurrency(investment.returns)}
                    </p>
                  </div>
                </div>
                
                {investment.maturityDate && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Maturity Date</span>
                      </div>
                      <span className="text-sm font-medium">{formatDate(investment.maturityDate)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Investments;