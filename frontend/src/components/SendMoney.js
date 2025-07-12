import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { transactionAPI } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ArrowLeft, Send } from 'lucide-react';

const SendMoney = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshUserData } = useAuth();
  const { addToast } = useToast();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    recipient_name: '',
    recipient_account: '',
    recipient_phone: '',
    amount: location.state?.amount || '',
    description: '',
    pin: ''
  });

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.recipient_name || !formData.recipient_account) {
        addToast('Please fill in recipient details', 'error');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        addToast('Please enter a valid amount', 'error');
        return;
      }
      if (parseFloat(formData.amount) > user.balance) {
        addToast('Insufficient balance', 'error');
        return;
      }
      setStep(3);
    }
  };

  const handleSendMoney = async (e) => {
    e.preventDefault();
    if (formData.pin.length !== 4) {
      addToast('Please enter 4-digit PIN', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await transactionAPI.sendMoney({
        recipient_name: formData.recipient_name,
        recipient_account: formData.recipient_account,
        recipient_phone: formData.recipient_phone,
        amount: parseFloat(formData.amount),
        description: formData.description,
        pin: formData.pin
      });

      await refreshUserData();
      addToast('Money sent successfully!', 'success');
      navigate('/');
    } catch (error) {
      addToast(error.response?.data?.detail || 'Failed to send money', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => step > 1 ? setStep(step - 1) : navigate('/transactions')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">Send Money</h1>
        </div>
        
        {/* Progress Indicator */}
        <div className="flex items-center mt-4 space-x-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full transition-all duration-200 ${
                i <= step ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Step 1: Recipient Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Recipient Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient_name">Recipient Name</Label>
                  <Input
                    id="recipient_name"
                    name="recipient_name"
                    value={formData.recipient_name}
                    onChange={handleInputChange}
                    placeholder="Enter recipient name"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipient_account">Account Number</Label>
                  <Input
                    id="recipient_account"
                    name="recipient_account"
                    value={formData.recipient_account}
                    onChange={handleInputChange}
                    placeholder="Enter account number"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipient_phone">Phone Number (Optional)</Label>
                  <Input
                    id="recipient_phone"
                    name="recipient_phone"
                    value={formData.recipient_phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleNext}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Next
            </Button>
          </div>
        )}

        {/* Step 2: Amount */}
        {step === 2 && (
          <div className="space-y-6">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Enter Amount</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    $
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      className="bg-transparent border-none outline-none text-center"
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    Available balance: {formatCurrency(user.balance)}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="What's this for?"
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleNext}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Next
            </Button>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="space-y-6">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Confirm Transaction</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">To:</span>
                    <span className="font-medium">{formData.recipient_name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Account:</span>
                    <span className="font-medium">{formData.recipient_account}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-bold text-lg">{formatCurrency(formData.amount)}</span>
                  </div>
                  {formData.description && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Description:</span>
                      <span className="font-medium">{formData.description}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <form onSubmit={handleSendMoney} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pin">Enter 4-digit PIN</Label>
                <Input
                  id="pin"
                  name="pin"
                  type="password"
                  maxLength="4"
                  value={formData.pin}
                  onChange={handleInputChange}
                  placeholder="Enter PIN"
                  className="w-full text-center text-lg tracking-widest"
                />
              </div>
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                {loading ? 'Sending...' : 'Send Money'}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default SendMoney;