// import './App.jsx'
// import LoginScreen from './loginScreen.jsx'

// export default function App() {
//   return (
//     <div className="App">
//       <LoginScreen />
//     </div>
//   )
// }

import './styles/global.css';
import { useState } from 'react';

import Login from './pages/login.jsx';
import Upload from './pages/upload.jsx';
import Review from './pages/review.jsx';


export default function App() {
  // State machine controlling the Wizard flow
  // Steps: 'login' -> 'upload' -> 'review'
  const [currentStep, setCurrentStep] = useState('login');

  // We will pass this data up from the Upload screen to the Review screen later
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Render logic based on current state
  const renderScreen = () => {
    switch (currentStep) {
      case 'login':
        // Pass the setter function so the Login screen can trigger the next step
        return <Login onLoginSuccess={() => setCurrentStep('upload')} />;
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
        return <Review files={uploadedFiles} onReset={() => setCurrentStep('upload')} />;
      default:
        return <Login onLoginSuccess={() => setCurrentStep('upload')} />;
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {renderScreen()}
    </main>
  );
}
