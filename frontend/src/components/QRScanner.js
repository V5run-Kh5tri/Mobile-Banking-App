import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, QrCode, Camera, Upload, Zap } from 'lucide-react';

const QRScanner = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);

  const handleStartScan = () => {
    setScanning(true);
    // Simulate QR code scanning
    setTimeout(() => {
      const mockQRData = {
        type: 'payment',
        merchant: 'Coffee Shop',
        amount: 4.50,
        merchantId: 'COFFEE123',
        description: 'Latte + Muffin'
      };
      setScannedData(mockQRData);
      setScanning(false);
      addToast('QR code scanned successfully!', 'success');
    }, 3000);
  };

  const handlePay = () => {
    // Simulate payment processing
    addToast('Payment processed successfully!', 'success');
    navigate('/');
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
          <h1 className="text-xl font-semibold text-gray-900">QR Scanner</h1>
        </div>
      </div>

      <div className="px-6 py-6">
        {!scanning && !scannedData ? (
          <div className="space-y-6">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Scan QR Code</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <div className="w-32 h-32 border-4 border-dashed border-gray-300 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <QrCode className="w-16 h-16 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-6">
                    Point your camera at a QR code to scan it
                  </p>
                  
                  <div className="space-y-3">
                    <Button
                      onClick={handleStartScan}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Start Scanning
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => addToast('Image upload feature coming soon!', 'info')}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload QR Image
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Quick Pay</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'Coffee Shop', amount: 4.50, icon: '☕' },
                    { name: 'Gas Station', amount: 45.00, icon: '⛽' },
                    { name: 'Grocery Store', amount: 23.75, icon: '🛒' },
                    { name: 'Restaurant', amount: 35.20, icon: '🍽️' }
                  ].map((merchant, index) => (
                    <div
                      key={index}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200"
                      onClick={() => {
                        setScannedData({
                          type: 'payment',
                          merchant: merchant.name,
                          amount: merchant.amount,
                          merchantId: `MERCHANT${index + 1}`,
                          description: 'Quick payment'
                        });
                      }}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-1">{merchant.icon}</div>
                        <p className="text-sm font-medium text-gray-900">{merchant.name}</p>
                        <p className="text-xs text-gray-500">{formatCurrency(merchant.amount)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : scanning ? (
          <div className="space-y-6">
            <Card className="bg-white border-gray-200">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-64 h-64 bg-gray-900 rounded-lg mx-auto mb-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20"></div>
                    <div className="absolute inset-4 border-2 border-white rounded-lg"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-16 h-16 border-2 border-white rounded animate-pulse"></div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-white/90 backdrop-blur-sm rounded px-3 py-1">
                        <p className="text-xs font-medium text-gray-900">Scanning...</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Hold your phone steady and point it at the QR code
                  </p>
                  <div className="flex space-x-2 justify-center">
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Button
              onClick={() => setScanning(false)}
              variant="outline"
              className="w-full"
            >
              Cancel Scan
            </Button>
          </div>
        ) : scannedData ? (
          <div className="space-y-6">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {scannedData.merchant}
                  </h3>
                  <p className="text-3xl font-bold text-green-600 mb-2">
                    {formatCurrency(scannedData.amount)}
                  </p>
                  <p className="text-gray-600">{scannedData.description}</p>
                </div>
                
                <div className="space-y-3 border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Merchant ID:</span>
                    <span className="font-medium">{scannedData.merchantId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-bold">{formatCurrency(scannedData.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Type:</span>
                    <span className="font-medium">QR Code</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-3">
              <Button
                onClick={handlePay}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <Zap className="w-4 h-4 mr-2" />
                Pay Now
              </Button>
              
              <Button
                onClick={() => setScannedData(null)}
                variant="outline"
                className="w-full"
              >
                Scan Another Code
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default QRScanner;