import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, getAuthToken, setAuthToken } from '../services/api';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; mobile: string; password: string; role?: string; department_id?: number | null }) => Promise<void>;
  logout: () => Promise<void>;
  quickSwitchDemo: (role: 'citizen' | 'cmo_admin' | 'dept_officer') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      api.getMe()
        .then(res => {
          setUser(res.user);
        })
        .catch(() => {
          setAuthToken(null);
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    setAuthToken(res.token);
    setUser(res.user);
  };

  const register = async (data: { name: string; email: string; mobile: string; password: string; role?: string; department_id?: number | null }) => {
    const res = await api.register(data);
    setAuthToken(res.token);
    setUser(res.user);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    } finally {
      setAuthToken(null);
      setUser(null);
    }
  };

  const quickSwitchDemo = async (targetRole: 'citizen' | 'cmo_admin' | 'dept_officer') => {
    setIsLoading(true);
    try {
      if (targetRole === 'cmo_admin') {
        await login('cmo.admin@kerala.gov.fake', 'Admin@CMO2026');
      } else if (targetRole === 'dept_officer') {
        await login('pwd.officer@kerala.gov.fake', 'Officer@PWD2026');
      } else {
        await login('citizen.kerala@test.com', 'Citizen@Kerala2026');
      }
    } catch (err) {
      console.error('Quick demo switch failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        quickSwitchDemo
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
