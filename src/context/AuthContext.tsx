

import React, { createContext, useContext, useEffect, useState } from 'react';
import { mockLogin } from '../services/api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Student';
  status: 'Active' | 'Suspended';
  profilePhoto?: string;
  roomNumber?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<UserProfile>;
  logout: () => Promise<void>;
  updateUserProfileState: (updates: Partial<UserProfile>) => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('kp_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch {
      localStorage.removeItem('kp_user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string, _rememberMe: boolean): Promise<UserProfile> => {
    setLoading(true);
    try {
      const result = await mockLogin(email, password);
      if (result.success && result.user) {
        setUser(result.user);
        localStorage.setItem('kp_user', JSON.stringify(result.user));
        return result.user;
      }
      throw new Error(result.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('kp_user');
    window.location.href = '/auth/login';
  };

  const updateUserProfileState = (updates: Partial<UserProfile>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('kp_user', JSON.stringify(updatedUser));
    }
  };

  const checkAuth = async () => {
    // In mock mode, session is always read from localStorage — no server call needed
    try {
      const savedUser = localStorage.getItem('kp_user');
      if (savedUser) setUser(JSON.parse(savedUser));
    } catch {
      setUser(null);
      localStorage.removeItem('kp_user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUserProfileState, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
