import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ArrowLeft, Download, Share2, Copy } from 'lucide-react';
import { mockRecentContacts } from '../data/mockData';

const RequestMoney = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    recipientName: '',
    recipientPhone: '',
    amount: '',
    description: ''
  });
  const [requestLink, setRequestLink] = useState('');

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleContactSelect = (contact) => {
    setFormData(prev => ({
      ...prev,
      recipientName: contact.name,
      recipientPhone: contact.phone
    }));
  };

  const handleCreateRequest = (e) => {
    e.preventDefault();
    if (!formData.recipientName || !formData.amount) {
      addToast('Please fill in required fields', 'error');
      return;
    }

    // Generate mock request link
    const requestId = Math.random().toString(36).substr(2, 9);
    const link = `https://securebank.com/pay/${requestId}`;
    setRequestLink(link);
    
    addToast('Payment request created!', 'success');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(requestLink);
    addToast('Link copied to clipboard!', 'success');
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Payment Request',
        text: `${formData.recipientName} has requested $${formData.amount} for ${formData.description}`,
        url: requestLink
      });
    } else {
      copyLink();
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
            onClick={() => navigate('/transactions')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">Request Money</h1>
        </div>
      </div>

      <div className="px-6 py-6">
        {!requestLink ? (
          <form onSubmit={handleCreateRequest} className="space-y-6">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Request Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipientName">From (Name)</Label>
                  <Input
                    id="recipientName"
                    name="recipientName"
                    value={formData.recipientName}
                    onChange={handleInputChange}
                    placeholder="Enter payer's name"
                    className="w-full"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipientPhone">Phone Number</Label>
                  <Input
                    id="recipientPhone"
                    name="recipientPhone"
                    value={formData.recipientPhone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="Enter amount"
                    className="w-full"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
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

            {/* Recent Contacts */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Recent Contacts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockRecentContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all duration-200"
                      onClick={() => handleContactSelect(contact)}
                    >
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-green-600 font-semibold text-sm">{contact.avatar}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{contact.name}</p>
                        <p className="text-sm text-gray-500">{contact.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Create Request
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Request Created!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Download className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {formatCurrency(formData.amount)}
                  </h3>
                  <p className="text-gray-600">
                    Requested from {formData.recipientName}
                  </p>
                  {formData.description && (
                    <p className="text-sm text-gray-500 mt-2">
                      For: {formData.description}
                    </p>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Payment Link:</p>
                    <p className="text-sm font-mono text-gray-900 break-all">{requestLink}</p>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      onClick={copyLink}
                      variant="outline"
                      className="flex-1"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </Button>
                    <Button
                      onClick={shareLink}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full"
            >
              Back to Home
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestMoney;