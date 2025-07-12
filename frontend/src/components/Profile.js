import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { 
  ArrowLeft, 
  User, 
  Settings, 
  Bell, 
  Shield, 
  CreditCard, 
  HelpCircle, 
  LogOut,
  Edit,
  Eye,
  EyeOff,
  Fingerprint
} from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const [editingProfile, setEditingProfile] = useState(false);
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    sms: false,
    transactions: true
  });

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const handleProfileSave = () => {
    // Mock profile update
    setEditingProfile(false);
    addToast('Profile updated successfully!', 'success');
  };

  const handleNotificationChange = (key, value) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
    addToast(`${key} notifications ${value ? 'enabled' : 'disabled'}`, 'info');
  };

  const handleLogout = () => {
    logout();
    addToast('Logged out successfully', 'success');
    navigate('/auth');
  };

  const menuItems = [
    { icon: Bell, label: 'Notifications', action: () => {}, color: 'text-blue-600' },
    { icon: Shield, label: 'Security', action: () => {}, color: 'text-green-600' },
    { icon: CreditCard, label: 'Cards & Payments', action: () => {}, color: 'text-purple-600' },
    { icon: HelpCircle, label: 'Help & Support', action: () => {}, color: 'text-orange-600' },
    { icon: Settings, label: 'Settings', action: () => {}, color: 'text-gray-600' }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-b-3xl">
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold">Profile</h1>
        </div>

        {/* Profile Summary */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <p className="text-white/80">{user?.email}</p>
            <p className="text-white/80 text-sm">Member since {new Date(user?.createdAt).getFullYear()}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditingProfile(true)}
            className="text-white hover:bg-white/10"
          >
            <Edit className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Account Details */}
        <Card className="bg-white border-gray-200 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">Account Details</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAccountDetails(!showAccountDetails)}
              >
                {showAccountDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Account Number</span>
                <span className="font-medium">
                  {showAccountDetails ? user?.accountNumber : '•••• •••• •••• 7890'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">IFSC Code</span>
                <span className="font-medium">{user?.ifscCode}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Account Type</span>
                <span className="font-medium">{user?.accountType || 'Savings'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Balance</span>
                <span className="font-bold text-green-600">
                  {showAccountDetails ? formatCurrency(user?.balance || 0) : '•••••••'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Settings */}
        <Card className="bg-white border-gray-200 mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-gray-900 capitalize">{key} Notifications</p>
                  <p className="text-sm text-gray-500">
                    {key === 'push' && 'Get push notifications on your device'}
                    {key === 'email' && 'Receive notifications via email'}
                    {key === 'sms' && 'Get SMS notifications for important updates'}
                    {key === 'transactions' && 'Notify about all transactions'}
                  </p>
                </div>
                <Switch
                  checked={value}
                  onCheckedChange={(checked) => handleNotificationChange(key, checked)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="bg-white border-gray-200 mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <Fingerprint className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Biometric Login</p>
                  <p className="text-sm text-gray-500">Use fingerprint or face recognition</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-500">Extra security for your account</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            <Button variant="outline" className="w-full mt-4">
              Change PIN
            </Button>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <div className="space-y-3 mb-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card key={index} className="bg-white border-gray-200 hover:shadow-md transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between cursor-pointer" onClick={item.action}>
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-5 h-5 ${item.color}`} />
                      <span className="font-medium text-gray-900">{item.label}</span>
                    </div>
                    <span className="text-gray-400">›</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Logout */}
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full bg-red-600 hover:bg-red-700 text-white"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Edit Profile Modal */}
      {editingProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Edit Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditingProfile(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleProfileSave}
                >
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Profile;