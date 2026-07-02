// src/App.jsx
import { useState } from 'react';
import './styles/global.css';

import Login from './pages/login.jsx';
import Register from './pages/register.jsx';
import Upload from './pages/upload.jsx';
import Dashboard from './pages/dashboard.jsx'; 
import Review from './pages/review.jsx';

export default function App() {
  const [currentStep, setCurrentStep] = useState('login');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogout = () => {
    setCurrentUser(null);
    setUploadedFiles([]);
    setCurrentStep('login');
  };

  // State Machine Routing: I am managing the component lifecycle here based on the current step.
  const renderScreen = () => {
    switch (currentStep) {
      case 'login':
        return (
          <Login 
            onLoginSuccess={(userData) => {
              setCurrentUser(userData);
              setCurrentStep('upload');
            }} 
            onSwitchToRegister={() => setCurrentStep('register')} 
          />
        );
      case 'register':
        return <Register onSwitchToLogin={() => setCurrentStep('login')} />;
      case 'upload':
        return (
          <Upload 
            onFilesProcessed={(files) => {
              setUploadedFiles(files);
              // Pipeline Interception: Instead of jumping straight to the Review screen, 
              // we now hand off the extracted file data to the Dashboard for visual analysis first.
              setCurrentStep('dashboard'); 
            }} 
          />
        );
      case 'dashboard':
        return (
          // Rendering the new analytical dashboard. 
          // onProceed moves them forward to the AI review, onBack lets them re-upload.
          <Dashboard 
            files={uploadedFiles} 
            onProceed={() => setCurrentStep('review')}
            onBack={() => setCurrentStep('upload')} 
          />
        );
        // Inside App.jsx
      case 'review':
        return (
          <Review 
            files={uploadedFiles} 
            onReset={() => {
              setUploadedFiles([]);       // <--- 1. Clear the old data
              setCurrentStep('upload');   // <--- 2. Send them back to the start
            }} 
          />
        );
      default:
        return <Login onLoginSuccess={() => setCurrentStep('upload')} />;
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {currentUser && (
        <header style={{ 
          padding: '16px 32px', display: 'flex', justifyContent: 'space-between', 
          alignItems: 'center', borderBottom: '1px solid var(--border-color)' 
        }}>
          {/* Header Navigation Logic: Dynamically rendering back buttons based on current state */}
          <div>
            {currentStep === 'upload' && (
              <button 
                onClick={handleLogout} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px' }}
              >
                ← Back to Login
              </button>
            )}
            {/* Added: Navigation fallback for the new Dashboard step */}
            {currentStep === 'dashboard' && (
              <button 
                onClick={() => setCurrentStep('upload')} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px' }}
              >
                ← Back to Upload
              </button>
            )}
            {currentStep === 'review' && (
              <button 
                onClick={() => setCurrentStep('dashboard')} // Adjusted to go back to Dashboard
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px' }}
              >
                ← Back to Dashboard
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{currentUser.email}</span>
            <img 
              src={currentUser.profileImage} 
              alt="Profile" 
              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-accent)' }} 
            />
            <button 
              onClick={handleLogout} 
              style={{ background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
            >
              Logout
            </button>
          </div>
        </header>
      )}

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {renderScreen()}
      </div>
    </main>
  );
}