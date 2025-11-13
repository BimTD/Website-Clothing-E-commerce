import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/services/api';
import { tokenStorage } from '@/utils/tokenStorage';
import { User, LoginRequest, RegisterRequest, ApiResponse } from '@/types/auth';

// Context quản lý authentication state

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginRequest) => Promise<ApiResponse>;
  register: (userData: RegisterRequest) => Promise<ApiResponse>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async (): Promise<void> => {
      const token = tokenStorage.getToken();
      if (token) {
        try {
          const response = await authAPI.getCurrentUser();
          setUser(response.data);
        } catch (error) {
          tokenStorage.clear();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<ApiResponse> => {
    try {
      const response = await authAPI.login(credentials);
      const { token, username, roles } = response.data;
      
      tokenStorage.setToken(token);
      tokenStorage.setUser({ username, roles });
      setUser({ username, roles });
      
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData: RegisterRequest): Promise<ApiResponse> => {
    try {
      const response = await authAPI.register(userData);
      return { success: true, message: response.data.message };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = (): void => {
    tokenStorage.clear();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};