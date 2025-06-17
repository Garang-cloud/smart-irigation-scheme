import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom'; // Assuming you're using react-router for navigation
import './LoginPage.css';

const LoginPage = ({ onLoginSuccess }) => {
  const navigate = useNavigate(); // Hook for navigation

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage('Login successful!');
      navigate('/'); // Assuming you have a navigate function to redirect
    } catch (error) {
      setMessage('Login failed: ' + error.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setMessage('Registration successful! You can now log in.');
      setEmail('');
      setPassword('');
    } catch (error) {
      setMessage('Registration failed: ' + error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login / Register</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {message && <p className="auth-message">{message}</p>}
          <div className="button-group">
            <button type="submit" onClick={handleLogin} className="login-button">Login</button>
            <button type="button" onClick={handleRegister} className="register-button">Register</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;