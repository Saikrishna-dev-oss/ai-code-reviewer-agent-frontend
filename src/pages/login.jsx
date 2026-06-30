// src/pages/login.jsx
import { useState } from 'react';
import './login.css';

export default function Login({ onLoginSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsAuthenticating(true);

    try {
      // 1. Query the JSON Server for a user matching this exact email and password
      const response = await fetch(`http://localhost:5000/users?email=${email}&password=${password}`);
      
      if (!response.ok) throw new Error('Network response was not ok');
      
      const users = await response.json();

      // 2. Check if a match was found
      if (users.length > 0) {
        // Success! Pass the full user object (including their image) back to App.jsx
        onLoginSuccess(users[0]);
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Database error: Is JSON Server running?');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <h1>AI Code Reviewer</h1>
          <p>Authenticate to access the agent</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" id="email" className="login-input" 
              placeholder="developer@example.com" value={email}
              onChange={(e) => setEmail(e.target.value)} required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" id="password" className="login-input" 
              placeholder="••••••••" value={password}
              onChange={(e) => setPassword(e.target.value)} required
            />
          </div>

          {/* Display authentication errors */}
          {error && <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>{error}</p>}

          <button type="submit" className="login-button" disabled={isAuthenticating}>
            {isAuthenticating ? 'Verifying...' : 'Login'}
          </button>
          
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button 
            type="button" onClick={onSwitchToRegister} 
            style={{ background: 'none', border: 'none', color: 'var(--primary-accent)', cursor: 'pointer', fontSize: '14px' }}
          >
            Don't have an account? <b style={{ color: 'var(--primary-accent)' }}>Create one</b>
          </button>
        </div>
      </div>
    </div>
  );
}