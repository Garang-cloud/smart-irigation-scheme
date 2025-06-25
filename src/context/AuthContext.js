import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { auth } from '../firebase'; // Import the 'auth' object from your firebaseConfig.js
import { signInWithCustomToken, onAuthStateChanged } from 'firebase/auth'; // Import Firebase client-side auth functions

// Create a Context for authentication
export const AuthContext = createContext(null);

// Define your backend URL
const BACKEND_URL = 'http://localhost:5000';

// AuthProvider component to wrap your application
export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken')); // Load token from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Default to false
  const [loading, setLoading] = useState(true); // To indicate if auth check is complete

  // Function to perform login (called by LoginPage)
  const login = async (email, password) => {
    try {
      // Step 1: Request a custom token from your backend's /api/auth/login endpoint
      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, { email, password });
      const customToken = response.data.token;

      // Step 2: Use Firebase client SDK to sign in with the custom token
      // This establishes the client-side Firebase session.
      await signInWithCustomToken(auth, customToken); // THIS IS CRUCIAL FOR CLIENT-SIDE AUTH STATE!

      localStorage.setItem('authToken', customToken); // Store the custom token for persistence
      setAuthToken(customToken);
      setIsAuthenticated(true); // Update authentication state immediately
      return { success: true };
    } catch (error) {
      console.error('AuthContext Login error:', error.response ? error.response.data : error.message);
      setIsAuthenticated(false); // Ensure state is false on failure
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  // Function to perform logout
  const logout = async () => {
    localStorage.removeItem('authToken'); // Clear token from localStorage
    setAuthToken(null);
    setIsAuthenticated(false); // Update authentication state
    // Explicitly sign out from Firebase client SDK
    try {
      if (auth.currentUser) {
        await auth.signOut();
      }
    } catch (error) {
      console.error("Error signing out from Firebase client:", error);
    }
  };

  // Effect for initial authentication check and setting up Axios interceptors
  useEffect(() => {
    // Axios Request Interceptor: Automatically adds the Authorization header
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken'); // Always get latest token from localStorage
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Axios Response Interceptor: Handles 401/403 errors (unauthorized/forbidden) by logging out
    const responseInterceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          console.warn('Authentication error caught by interceptor. Logging out...');
          logout(); // Log out if unauthorized or forbidden
        }
        return Promise.reject(error);
      }
    );

    // Firebase Auth State Listener: This is crucial for keeping isAuthenticated state in sync
    // with Firebase's internal auth state (e.g., after signInWithCustomToken or page reload).
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in. This means signInWithCustomToken was successful or a session persists.
        setIsAuthenticated(true);
      } else {
        // User is signed out.
        setIsAuthenticated(false);
        localStorage.removeItem('authToken'); // Ensure local token is cleared if Firebase signs out
      }
      setLoading(false); // Auth check is complete once this listener runs
    });


    // Cleanup: remove the interceptors and unsubscribe from auth state changes when component unmounts
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
      unsubscribe(); // Clean up Firebase listener
    };
  }, []); // Empty dependency array means this effect runs only once on mount

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

export const useAuth = () => {
  return useContext(AuthContext);
};
