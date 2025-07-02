import React, { createContext, useContext, useEffect, useState } from 'react';
import { STORAGE_KEYS } from '../constants';
import { authAPI } from '../services/api';

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
  const [token, setToken] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  });

  // Function to save token and user data
  const saveAuth = (authData) => {
    const { token: newToken, user: userData } = authData;

    setToken(newToken);
    setUser(userData);

    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken);

    // Set default axios header
    if (window.axios) {
      window.axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    }
  };

  // Function to clear auth data
  const clearAuth = () => {
    setToken(null);
    setUser(null);

    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);

    // Clear axios header
    if (window.axios) {
      delete window.axios.defaults.headers.common['Authorization'];
    }
  };

  // Login function (returns promise, let components handle navigation)
  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      saveAuth(response.data);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Register function (returns promise, let components handle navigation)
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      saveAuth(response.data);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Logout function (returns promise, let components handle navigation)
  const logout = async () => {
    try {
      // Call logout API if needed
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      clearAuth();
    }
  };

  // Function to get current user profile
  const getCurrentUser = async () => {
    try {
      const response = await authAPI.getProfile();
      setUser(response.data);
      return response.data;
    } catch (error) {
      // If getting profile fails, user is likely not authenticated
      clearAuth();
      throw error;
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!token && !!user;
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          // Set axios header
          if (window.axios) {
            window.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          }

          // Get user profile to validate token
          await getCurrentUser();
        } catch (error) {
          console.error('Auth initialization error:', error);
          clearAuth();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  // Handle Google OAuth callback
  const handleGoogleCallback = async (tokenFromCallback) => {
    try {
      const response = await authAPI.googleCallback(tokenFromCallback);
      saveAuth(response.data);
      return response;
    } catch (error) {
      clearAuth();
      throw error;
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    getCurrentUser,
    isAuthenticated,
    handleGoogleCallback,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};