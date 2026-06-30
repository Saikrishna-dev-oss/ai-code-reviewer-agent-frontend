// // src/App.jsx
import { useState } from 'react';
import './styles/global.css';

import Login from './pages/login.jsx';
import Register from './pages/register.jsx'; // 1. Import the new screen
import Upload from './pages/upload.jsx';
import Review from './pages/review.jsx';

// export default function App() {
//   // Available Steps: 'login' | 'register' | 'upload' | 'review'
//   const [currentStep, setCurrentStep] = useState('login');
//   const [uploadedFiles, setUploadedFiles] = useState([]);

//   const renderScreen = () => {
//     switch (currentStep) {
//       case 'login':
//         return (
//           <Login 
//             onLoginSuccess={() => setCurrentStep('upload')} 
//             onSwitchToRegister={() => setCurrentStep('register')} // 2. Add route to register
//           />
//         );
//       case 'register':
//         return (
//            // 3. Add the Register component and pass the route back to login
//           <Register onSwitchToLogin={() => setCurrentStep('login')} />
//         );
//       case 'upload':
//         return (
//           <Upload 
//             onFilesProcessed={(files) => {
//               setUploadedFiles(files);
//               setCurrentStep('review');
//             }} 
//           />
//         );
//       case 'review':
//         return <Review files={uploadedFiles} onReset={() => setCurrentStep('upload')} />;
//       default:
//         return <Login onLoginSuccess={() => setCurrentStep('upload')} />;
//     }
//   };

//   return (
//     <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//       {renderScreen()}
//     </main>
//   );
// }

// src/App.jsx
// ... keep your imports exactly the same

export default function App() {
  const [currentStep, setCurrentStep] = useState('login');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogout = () => {
    setCurrentUser(null);
    setUploadedFiles([]);
    setCurrentStep('login');
  };

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
              setCurrentStep('review');
            }} 
          />
        );
      case 'review':
        return (
          <Review 
            files={uploadedFiles} 
            // HERE: Pass a function that lets them back out of the review screen safely
            onReset={() => setCurrentStep('upload')} 
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
          padding: '16px 32px', display: 'flex', justifyContent: 'space-between', // Changed to space-between
          alignItems: 'center', borderBottom: '1px solid var(--border-color)' 
        }}>
          {/* App-controlled Back Button for the Ingestion Workflow */}
          <div>
            {currentStep === 'upload' && (
              <button 
                onClick={handleLogout} // Going back from upload logs you out securely
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px' }}
              >
                ← Back to Login
              </button>
            )}
            {currentStep === 'review' && (
              <button 
                onClick={() => setCurrentStep('upload')} // Going back from review takes you back to drag-drop
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px' }}
              >
                ← Back to Upload
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