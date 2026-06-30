// src/pages/register.jsx
import { useState, useRef } from 'react';
import './login.css'; // We can reuse the login CSS for the card layout!

export default function Register({ onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profileImage, setProfileImage] = useState(null); // Stores the Base64 image
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  // 1. Handle the Image Upload
  // 1. Handle the Image Upload & Compression
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Force the image dimensions to be very small
        const width = 100;
        const height = (img.height * 100) / img.width;
        
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress the image heavily (jpeg format, 0.5 quality)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5);
        
        setProfileImage(compressedBase64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };
  // 2. Handle the Form Submission
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !password || !profileImage) {
      setError('Please provide an email, password, and profile image.');
      return;
    }

    setIsRegistering(true);
    setError('');

    try {
      // POST the new user to our JSON Server
      const response = await fetch('http://localhost:5000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password, 
          profileImage 
        })
      });

      if (!response.ok) throw new Error('Registration failed');

      alert("Registration successful! You can now log in.");
      onSwitchToLogin(); // Route them back to the login screen
      
    } catch (err) {
      setError("Database Error: Is your JSON server running on port 5000?");
      console.error(err);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        
        <div className="login-header">
          <h1>Register Agent</h1>
          <p>Create a new developer profile</p>
        </div>

        <form className="login-form" onSubmit={handleRegister}>
          
          {/* Image Upload UI */}
          <div className="input-group" style={{ alignItems: 'center', marginBottom: '16px' }}>
             <input 
               type="file" 
               accept="image/*" 
               ref={fileInputRef} 
               style={{ display: 'none' }} 
               onChange={handleImageUpload}
             />
             <div 
               onClick={() => fileInputRef.current.click()}
               style={{
                 width: '80px', height: '80px', borderRadius: '50%',
                 backgroundColor: 'var(--bg-dark)', border: '2px dashed var(--border-color)',
                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                 cursor: 'pointer', overflow: 'hidden', color: 'var(--text-muted)', fontSize: '12px'
               }}
             >
               {profileImage ? (
                 <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
               ) : (
                 "Upload Photo"
               )}
             </div>
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" id="email" className="login-input" 
              value={email} onChange={(e) => setEmail(e.target.value)} required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" id="password" className="login-input" 
              value={password} onChange={(e) => setPassword(e.target.value)} required
            />
          </div>

          {error && <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>{error}</p>}

          <button type="submit" className="login-button" disabled={isRegistering}>
            {isRegistering ? 'Creating Profile...' : 'Create Account'}
          </button>
          
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button onClick={onSwitchToLogin} style={{ background: 'none', border: 'none', color: 'var(--primary-accent)', cursor: 'pointer' }}>
            Already have an account? Log in
          </button>
        </div>

      </div>
    </div>
  );
}