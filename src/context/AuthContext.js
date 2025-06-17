import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Create a Context for authentication
export const AuthContext = createContext(null);

// Define your backend URL
const BACKEND_URL = 'http://localhost:5000';

// AuthProvider component to wrap your application
export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken')); // Load token from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(!!authToken); // Set authenticated based on token presence
  const [loading, setLoading] = useState(true); // To indicate if auth check is complete

  // Function to perform login
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, { email, password });
      const token = response.data.token;
      localStorage.setItem('authToken', token); // Store token
      setAuthToken(token);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('AuthContext Login error:', error.response ? error.response.data : error.message);
      setIsAuthenticated(false);
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  // Function to perform logout
  const logout = () => {
    localStorage.removeItem('authToken'); // Remove token
    setAuthToken(null);
    setIsAuthenticated(false);
    // You might want to redirect after logout here or in the component
  };

  // Effect to set up Axios interceptor
  // This interceptor will automatically add the authorization header to every outgoing request
  useEffect(() => {
    if (authToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }

    // You can also add a response interceptor for automatic logout on 401/403
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          console.warn('Authentication error caught by interceptor. Logging out...');
          logout(); // Log out if unauthorized or forbidden
        }
        return Promise.reject(error);
      }
    );

    setLoading(false); // Authentication check is complete

    // Cleanup: remove the interceptor when the component unmounts
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [authToken]); // Re-run when authToken changes

  // The value provided to children components
  const authContextValue = {
    authToken,
    isAuthenticated,
    loading, // Provide loading state
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access to auth context
export const useAuth = () => {
  return useContext(AuthContext);
};
