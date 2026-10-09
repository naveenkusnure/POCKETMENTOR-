import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('pm_token');
    const savedUser = localStorage.getItem('pm_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: jwt, ...userData } = res.data;
    localStorage.setItem('pm_token', jwt);
    localStorage.setItem('pm_user', JSON.stringify(userData));
    setToken(jwt);
    setUser(userData);
    return res.data;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    const { token: jwt, ...userData } = res.data;
    localStorage.setItem('pm_token', jwt);
    localStorage.setItem('pm_user', JSON.stringify(userData));
    setToken(jwt);
    setUser(userData);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('pm_token');
    localStorage.removeItem('pm_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
