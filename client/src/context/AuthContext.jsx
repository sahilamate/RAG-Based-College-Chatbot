import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('collegeai_jwt_token') || null);
  const [loading, setLoading] = useState(true);

  // Restore persistent login session on refresh (F5)
  useEffect(() => {
    let isMounted = true;
    const restoreSession = async () => {
      setLoading(true);
      const storedToken = localStorage.getItem('collegeai_jwt_token');
      if (storedToken) {
        const currentUser = await authService.getCurrentUser();
        if (isMounted && currentUser) {
          setUser(currentUser);
          setToken(storedToken);
        } else if (isMounted) {
          setUser(null);
          setToken(null);
        }
      } else if (isMounted) {
        setUser(null);
        setToken(null);
      }
      if (isMounted) setLoading(false);
    };

    restoreSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const result = await authService.login(email, password);
      setUser(result.user);
      setToken(result.token);
      return result.user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    setLoading(true);
    try {
      const result = await authService.register(data);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = (updatedFields) => {
    if (!user) return;
    setUser((prev) => ({ ...prev, ...updatedFields }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        role: user?.role || null,
        isStudent: user?.role === 'student',
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateUserProfile,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
