import React, { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = ({ onLoginSuccess }) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage('Login successful!');
      navigate('/');
    } catch (error) {
      setMessage('Login failed: ' + error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login</h2>
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
            <button type="submit" className="login-button">Login</button>
            <button type="button" className="register-button" disabled>Register</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;