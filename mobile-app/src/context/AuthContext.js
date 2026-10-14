import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENDPOINTS } from '../config/api';

const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  sendOtp: async () => {},
  verifyOtp: async () => {},
  logout: async () => {},
  quickLogin: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const restore = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('nexhire_token');
        const savedUser = await AsyncStorage.getItem('nexhire_user');
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch (e) {
        console.warn('Failed to restore auth state:', e);
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const login = async (emailOrPhone, password, role) => {
    const res = await fetch(ENDPOINTS.login, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrPhone, password: password || "nexhire123", role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');

    if (data.token && data.user) {
      await AsyncStorage.setItem('nexhire_token', data.token);
      await AsyncStorage.setItem('nexhire_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data.user;
  };

  const register = async ({ name, email, phoneNumber, password }) => {
    const res = await fetch(ENDPOINTS.registerSeeker, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phoneNumber, password: password || "nexhire123" }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');

    // Frictionless: Automatically authenticate and set session if token is provided
    if (data.token && data.user) {
      await AsyncStorage.setItem('nexhire_token', data.token);
      await AsyncStorage.setItem('nexhire_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const sendOtp = async (identifier) => {
    const res = await fetch(ENDPOINTS.sendOtp, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrPhone: identifier }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
    return data;
  };

  const verifyOtp = async (identifier, otp) => {
    const res = await fetch(ENDPOINTS.verifyOtp, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrPhone: identifier, otp }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'OTP verification failed');

    if (data.token && data.user) {
      await AsyncStorage.setItem('nexhire_token', data.token);
      await AsyncStorage.setItem('nexhire_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('nexhire_token');
    await AsyncStorage.removeItem('nexhire_user');
    setToken(null);
    setUser(null);
  };

  // One-click demo login (Job Seeker only)
  const quickLogin = async () => {
    return login('seeker@portal.com', 'seeker123', 'job_seeker');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        sendOtp,
        verifyOtp,
        logout,
        quickLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
