import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProfileData, getUnreadNotificationsCount } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setUnreadCount(0);
  }, []);

  const fetchUser = useCallback(async (authToken = token) => {
    if (!authToken) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await getProfileData();
      if (data.data?.user) {
        setUser(data.data.user);
      }
    } catch (err) {
      console.error('Failed to fetch profile with stored token:', err);
      logout();
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  const refreshUnreadCount = useCallback(async () => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await getUnreadNotificationsCount();
      if (res.data?.unreadCount !== undefined) {
        setUnreadCount(res.data.unreadCount);
      }
    } catch {
      // Silent error for notification polling
    }
  }, []);

  const decrementUnreadCount = useCallback((amount = 1) => {
    setUnreadCount((prev) => Math.max(0, prev - amount));
  }, []);

  const clearUnreadCount = useCallback(() => {
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    if (token) {
      fetchUser(token);
      refreshUnreadCount();
      // Poll every 30s for real-time background count updates
      const interval = setInterval(refreshUnreadCount, 30000);
      return () => clearInterval(interval);
    } else {
      setUser(null);
      setUnreadCount(0);
      setLoading(false);
    }
  }, [token, fetchUser, refreshUnreadCount]);

  const login = (newToken, userData = null) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    if (userData) {
      setUser(userData);
    } else {
      fetchUser(newToken);
    }
    refreshUnreadCount();
  };

  const updateUser = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  const refreshProfile = async () => {
    if (token) {
      await fetchUser(token);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated: Boolean(token),
        unreadCount,
        decrementUnreadCount,
        clearUnreadCount,
        refreshUnreadCount,
        login,
        logout,
        updateUser,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
