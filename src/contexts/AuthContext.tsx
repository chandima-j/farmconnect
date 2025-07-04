import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Farmer, Buyer, Admin } from '../types';
import { apiClient } from '../lib/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  userType: 'farmer' | 'buyer' | 'admin';
  // Farmer specific fields
  farmName?: string;
  location?: string;
  description?: string;
  // Buyer specific fields
  address?: string;
  phone?: string;
  // Admin specific fields
  role?: 'super_admin' | 'admin' | 'moderator';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const token = localStorage.getItem('farmconnect_token');
      if (!token) {
        setLoading(false);
        return;
      }
      apiClient.setToken(token); // Ensure token is set in apiClient for requests
      const response = await apiClient.getCurrentUser();
      setUser(response.user);
    } catch (error) {
      console.error('Error loading current user:', error);
      // Clear invalid token
      localStorage.removeItem('farmconnect_token');
      apiClient.setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      // Enhanced email validation
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(userData.email)) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      // Convert userType to uppercase for API
      const apiUserData = {
        ...userData,
        userType: userData.userType.toUpperCase(),
        role: userData.role?.toUpperCase(),
      };

      await apiClient.register(apiUserData);
      return { success: true };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { success: false, error: error.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      const response: any = await apiClient.login(email, password);
      setUser(response.user);
      // Ensure token is set in apiClient and localStorage
      if (response.token) {
        apiClient.setToken(response.token);
        localStorage.setItem('farmconnect_token', response.token);
      }
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await apiClient.logout();
    setUser(null);
  };

  const isAdmin = user?.type === 'admin';
  const isSuperAdmin = user?.type === 'admin' && (user as Admin).role === 'super_admin';

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated: !!user,
      loading,
      isAdmin,
      isSuperAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}