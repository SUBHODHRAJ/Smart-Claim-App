import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { name: string; email: string; password: string; role?: UserRole; classGroup?: string }) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('cogniquiz_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('cogniquiz_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    const currentToken = localStorage.getItem('cogniquiz_token');
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await authService.getMe();
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem('cogniquiz_user', JSON.stringify(res.data));
      } else {
        logout();
      }
    } catch (err) {
      console.warn('[AuthContext] Session validation failed:', err);
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<User> => {
    // Clear previous user session cache completely
    localStorage.removeItem('cogniquiz_token');
    localStorage.removeItem('cogniquiz_user');
    sessionStorage.clear();

    const res = await authService.login(email, password);
    const newToken = res.data.token;
    const newUser = res.data.user;

    localStorage.setItem('cogniquiz_token', newToken);
    localStorage.setItem('cogniquiz_user', JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    classGroup?: string;
  }): Promise<User> => {
    localStorage.removeItem('cogniquiz_token');
    localStorage.removeItem('cogniquiz_user');
    sessionStorage.clear();

    const res = await authService.register(data);
    const newToken = res.data.token;
    const newUser = res.data.user;

    localStorage.setItem('cogniquiz_token', newToken);
    localStorage.setItem('cogniquiz_user', JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('cogniquiz_token');
    localStorage.removeItem('cogniquiz_user');
    sessionStorage.clear();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
