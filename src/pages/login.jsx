// src/pages/login.jsx
import { useState } from 'react';
import './login.css';

export default function Login({ onLoginSuccess }) {
  // Local state to track what the user types
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    // 1. Prevent the standard HTML form from refreshing the page
    e.preventDefault();
    
    // 2. Validate inputs (For now, just ensure they aren't totally empty)
    if (email && password) {
      console.log("Mock Authentication successful for:", email);
      
      // 3. Trigger the state change in App.jsx to move to the Upload screen
      onLoginSuccess();
    } else {
      alert("Please enter an email and password.");
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
              type="email" 
              id="email"
              className="login-input" 
              placeholder="developer@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password"
              className="login-input" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-button">
            Initialize Session
          </button>
          
        </form>
      </div>
    </div>
  );
}