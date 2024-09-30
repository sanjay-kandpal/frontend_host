import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { v4 as uuidv4 } from 'uuid';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [activeSessions, setActiveSessions] = useState([]);

  useEffect(() => {
    initializeDeviceId();
    checkAuthStatus();
  }, []);

  const initializeDeviceId = () => {
    let storedDeviceId = localStorage.getItem('deviceId');
    if (!storedDeviceId) {
      storedDeviceId = uuidv4();
      localStorage.setItem('deviceId', storedDeviceId);
    }
    setDeviceId(storedDeviceId);
    console.log('Device ID initialized:', storedDeviceId);
  };

  const checkAuthStatus = async () => {
    console.log('Checking auth status');
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token);
    if (token) {
      try {
        const response = await api.get('/api/auth/verify');
        console.log('Auth verification response:', response.data);
        setUser(response.data);
        setIsAuthenticated(true);
        fetchActiveSessions();
      } catch (error) {
        console.error('Token verification failed:', error);
        await logoutInternal();
      }
    } else {
      console.log('No token found, logging out internally');
      await logoutInternal();
    }
    setIsLoading(false);
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login');
      const response = await api.post('/api/auth/login', { email, password, deviceId });
      console.log('Login response:', response.data);
      const { token, userId } = response.data;
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
      await checkAuthStatus();
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logoutInternal = async () => {
    console.log('Logging out internally');
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    setActiveSessions([]);
  };

  const logout = async (logoutDeviceId = null) => {
    console.log('Logout called with deviceId:', logoutDeviceId);
    try {
      const deviceToLogout = logoutDeviceId || deviceId;
      console.log('Sending logout request for device:', deviceToLogout);
      const response = await api.post('/api/auth/logout', { deviceId: deviceToLogout });
      console.log('Logout response:', response.data);
      
      if (!logoutDeviceId || logoutDeviceId === deviceId) {
        console.log('Logging out current device');
        await logoutInternal();
      } else {
        console.log('Logging out different device, updating sessions');
        await fetchActiveSessions();
      }
    } catch (error) {
      console.error('Logout failed:', error);
      if (!logoutDeviceId || logoutDeviceId === deviceId) {
        console.log('Logout failed, but still logging out locally');
        await logoutInternal();
      }
    }
  };

  const fetchActiveSessions = async () => {
    try {
      console.log('Fetching active sessions');
      const response = await api.get('/api/auth/sessions');
      console.log('Active sessions:', response.data);
      setActiveSessions(response.data);
    } catch (error) {
      console.error('Failed to fetch active sessions:', error);
    }
  };

  const logoutDevice = async (logoutDeviceId) => {
    console.log('Logging out device:', logoutDeviceId);
    await logout(logoutDeviceId);
  };
  
  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isLoading, 
      user, 
      login, 
      logout,
      checkAuthStatus,
      activeSessions,
      logoutDevice,
      deviceId
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);