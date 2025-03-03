import React, { createContext, useContext, useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import API_ENDPOINTS from '../config/api';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  employeeId: string;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    department: string;
    employeeId: string;
  }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface LoginResponse {
  token: string;
  user: User;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post<LoginResponse>(
        API_ENDPOINTS.LOGIN,
        { email, password },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000, // 10 second timeout
          timeoutErrorMessage: 'Login request timed out'
        }
      );
    const { token: newToken, user: userData } = response.data;
    
    localStorage.setItem('token', newToken);
    localStorage.setItem('userRole', userData.role);
    
    setToken(newToken);
    setUser(userData);
    toast.success('Login successful!');
  } catch (error: any) {
    if (error.code === 'ECONNABORTED') {
      toast.error('Connection timed out. Please try again.');
      throw new Error('Connection timed out');
    }
    const errorMessage = error.response?.data?.message || error.message || 'Login failed';
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

  const register = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    department: string;
    employeeId: string;
  }) => {
    try {
      const response = await axios.post<LoginResponse>(API_ENDPOINTS.REGISTER, userData);

      const { token: newToken, user: newUser } = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      toast.success('Registration successful!');
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        throw axiosError;
      }
      throw new Error('An unexpected error occurred');
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const response = await axios.get<User>(API_ENDPOINTS.ME, {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          setUser(response.data);
          setToken(storedToken);
        } catch (error) {
          console.error('Auth initialization error:', error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  // Configure axios defaults
  axios.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : '';

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};