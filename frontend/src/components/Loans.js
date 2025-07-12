import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { ArrowLeft, Plus, Calendar, DollarSign, Percent, Clock } from 'lucide-react';
import { mockLoans } from '../data/mockData';

const Loans = () => {
  const navigate = useNavigate();
  const [selectedLoan, setSelectedLoan] = useState(null);

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

  const calculateProgress = (loan) => {
    const paidAmount = loan.amount - loan.outstanding;
    return (paidAmount / loan.amount) * 100;
  };

  const getDaysUntilDue = (dateString) => {
    const dueDate = new Date(dateString);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
            <h1 className="text-xl font-semibold text-gray-900">Loans</h1>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setSelectedLoan('new')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Apply
          </Button>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Active Loans */}
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-semibold text-gray-900">Active Loans</h2>
          
          {mockLoans.map((loan) => (
            <Card key={loan.id} className="bg-white border-gray-200 hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{loan.type}</h3>
                    <p className="text-sm text-gray-500">
                      {loan.remainingMonths} months remaining
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(loan.outstanding)}
                    </p>
                    <p className="text-sm text-gray-500">Outstanding</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm font-medium">
                      {calculateProgress(loan).toFixed(1)}% paid
                    </span>
                  </div>
                  <Progress value={calculateProgress(loan)} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">EMI</p>
                      <p className="font-medium">{formatCurrency(loan.emi)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Percent className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Interest</p>
                      <p className="font-medium">{loan.interestRate}%</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">Next EMI Due</p>
                      <p className="font-medium">{formatDate(loan.nextDueDate)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {getDaysUntilDue(loan.nextDueDate)} days left
                    </p>
                    <Button
                      size="sm"
                      className="mt-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      Pay EMI
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loan Application */}
        {selectedLoan === 'new' && (
          <Card className="bg-white border-gray-200 mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Apply for New Loan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { type: 'Personal Loan', rate: '10.5%', max: '$100,000', tenure: '5 years' },
                  { type: 'Home Loan', rate: '8.5%', max: '$500,000', tenure: '30 years' },
                  { type: 'Car Loan', rate: '9.0%', max: '$50,000', tenure: '7 years' },
                  { type: 'Education Loan', rate: '7.5%', max: '$75,000', tenure: '10 years' }
                ].map((loanType, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{loanType.type}</h4>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {loanType.rate}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Max: {loanType.max}</span>
                      <span>Up to {loanType.tenure}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedLoan(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    // Mock application process
                    setSelectedLoan(null);
                    // In real app, this would open loan application form
                  }}
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loan Calculator */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">EMI Calculator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Calculate your EMI</p>
              <p className="text-sm text-gray-500">
                Get instant EMI calculations for different loan amounts
              </p>
              <Button
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  // Mock EMI calculator
                  alert('EMI Calculator feature coming soon!');
                }}
              >
                Open Calculator
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Loans;