// src/pages/profile.jsx
import { useState } from 'react';
import './profile.css'; // Reverted to standard CSS import

export default function Profile({ currentUser, onUpdateSuccess, onBack }) {
  // We initialize the preview with the user's current image
  const [newImage, setNewImage] = useState(currentUser.profileImage);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. The exact same HTML5 Canvas compression from Registration
  const handleImageSelect = (e) => {
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
        const MAX_WIDTH = 150;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setNewImage(compressedBase64); // Update the local preview
        setError('');
        setSuccessMsg('');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // 2. Save the new image to the JSON Server
  const handleSaveProfile = async () => {
    setIsUpdating(true);
    setError('');
    setSuccessMsg('');

    try {
      // We use PATCH to only update the profileImage field, leaving email/password alone
      const response = await fetch(`http://localhost:5000/users/${currentUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileImage: newImage }),
      });

      if (!response.ok) throw new Error('Failed to update profile on the server.');

      const updatedUser = await response.json();
      setSuccessMsg('Profile updated successfully!');
      
      // Tell the Manager (App.jsx) to update the global state
      onUpdateSuccess(updatedUser);
      
    } catch (err) {
      console.error(err);
      setError('Network error. Is JSON Server running?');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="profile-wrapper">
      <div className="profile-header">
        <h2>My Account</h2>
        <p>Manage your developer profile</p>
      </div>

      <div>
        <p style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>
          Logged in as: <strong style={{ color: 'var(--text-main)' }}>{currentUser.email}</strong>
        </p>

        {/* Display the active or newly selected image */}
        <img src={newImage} alt="Profile Preview" className="avatar-preview" />

        {/* Hidden file input triggered by the styled label */}
        <input 
          type="file" 
          id="profile-upload" 
          accept="image/*" 
          style={{ display: 'none' }} 
          onChange={handleImageSelect} 
        />
        <label htmlFor="profile-upload" className="file-input-label">
          Choose New Avatar
        </label>
      </div>

      {error && <p style={{ color: '#ef4444', marginBottom: '16px', fontSize: '14px' }}>{error}</p>}
      {successMsg && <p style={{ color: '#10b981', marginBottom: '16px', fontSize: '14px' }}>{successMsg}</p>}

      <button 
        className="save-btn" 
        onClick={handleSaveProfile}
        // Disable button if nothing changed or currently saving
        disabled={isUpdating || newImage === currentUser.profileImage}
      >
        {isUpdating ? 'Saving...' : 'Save Profile Changes'}
      </button>

      <button 
        onClick={onBack} 
        style={{ marginTop: '24px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
      >
        ← Back to Application
      </button>
    </div>
  );
}