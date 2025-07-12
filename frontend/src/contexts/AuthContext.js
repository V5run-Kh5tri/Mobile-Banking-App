import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('bankingUser');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // Verify token with backend
      authAPI.getCurrentUser()
        .then(response => {
          const userData = response.data;
          setUser(userData);
          localStorage.setItem('bankingUser', JSON.stringify(userData));
        })
        .catch(() => {
          // Token is invalid
          localStorage.removeItem('authToken');
          localStorage.removeItem('bankingUser');
          setUser(null);
        });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const { user: userData, access_token } = response.data;
      
      setUser(userData);
      localStorage.setItem('authToken', access_token);
      localStorage.setItem('bankingUser', JSON.stringify(userData));
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await authAPI.signup(userData);
      const { user: newUser, access_token } = response.data;
      
      setUser(newUser);
      localStorage.setItem('authToken', access_token);
      localStorage.setItem('bankingUser', JSON.stringify(newUser));
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Signup failed' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('bankingUser');
  };

  const updateBalance = async (amount) => {
    try {
      const response = await userAPI.updateBalance(amount);
      const newBalance = response.data.balance;
      
      if (user) {
        const updatedUser = { ...user, balance: newBalance };
        setUser(updatedUser);
        localStorage.setItem('bankingUser', JSON.stringify(updatedUser));
      }
      
      return { success: true, balance: newBalance };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Balance update failed' 
      };
    }
  };

  const refreshUserData = async () => {
    try {
      const response = await userAPI.getProfile();
      const userData = response.data;
      setUser(userData);
      localStorage.setItem('bankingUser', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signup,
      logout,
      updateBalance,
      refreshUserData,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};