// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Check if token is expired
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp < currentTime) {
            logout();
          } else {
            // Set auth header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // Extract user info from token
            // Store the role and id from the decoded token
            setUser({
              _id: decoded.id,
              role: decoded.role || 'petugas', // Default to 'petugas' if role is not in token
              email: decoded.email || '',
              token: token
            });
            setIsAuthenticated(true);
          }
        } catch (err) {
          console.error('Token validation error:', err);
          logout();
        }
      }
      
      setLoading(false);
    };

    checkUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      localStorage.setItem('token', res.data.token);
      
      // Set auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      // Store complete user data
      setUser({
        _id: res.data._id,
        email: res.data.email,
        role: res.data.role,
        token: res.data.token
      });
      setIsAuthenticated(true);
      
      return true;
    } catch (err) {
      console.error(err.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};