// src/pages/upload.jsx
import { useState, useRef } from 'react';
import { extractCodeFiles } from '../util/utilParser'; 
import './upload.css';

export default function Upload({ onFilesProcessed }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedFiles, setExtractedFiles] = useState([]);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);

  // 1. Cleaned up Event Handler
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError('');
    setIsProcessing(true);

    try {
      // We pass the file to our utility, and it hands us back the clean data!
      const parsedData = await extractCodeFiles(file);
      setExtractedFiles(parsedData);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to process file.');
      setExtractedFiles([]);
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Trigger the transition to the Review screen
  const handleSubmit = () => {
    if (extractedFiles.length > 0) {
      onFilesProcessed(extractedFiles);
    }
  };

  return (
    <div className="upload-wrapper">
      <div className="upload-card">
        
        <div className="upload-header">
          <h2>Source Code Ingestion</h2>
          <p>Upload your project architecture for AI analysis.</p>
        </div>

        <input 
          type="file" 
          ref={fileInputRef} 
          className="file-input" 
          accept=".zip,.py,.js,.jsx,.sql" 
          onChange={handleFileChange}
        />

        <div className="dropzone" onClick={() => fileInputRef.current.click()}>
          {isProcessing ? (
            <p>Processing Archive...</p>
          ) : (
            <>
              <p>Click to browse or drag a file here</p>
              <span>Accepts .zip, .py, .js, .jsx, .sql</span>
            </>
          )}
        </div>

        {error && <p style={{ color: '#ef4444', marginBottom: '16px', fontSize: '14px' }}>{error}</p>}

        {/* Dynamic File Tree Preview (Inside upload.jsx) */}
        {extractedFiles.length > 0 && (
          <div className="file-preview">
            <h3>Detected {extractedFiles.length} files</h3>
            <ul className="file-list">
              {extractedFiles.slice(0, 50).map((fileObj, index) => (
                <li 
                  key={index} 
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span>{fileObj.fileName}</span>
                  
                  {/* Render the Category Badge */}
                  <span style={{ 
                    fontSize: '11px', 
                    padding: '2px 8px', 
                    borderRadius: '12px', 
                    backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                    color: 'var(--primary-accent)',
                    border: '1px solid var(--primary-accent)'
                  }}>
                    {fileObj.category}
                  </span>
                  
                </li>
              ))}
              {extractedFiles.length > 50 && (
                <li>...and {extractedFiles.length - 50} more files</li>
              )}
            </ul>
          </div>
        )}

        <button 
          className="submit-btn" 
          disabled={extractedFiles.length === 0 || isProcessing}
          onClick={handleSubmit}
        >
          Run AI Code Review
        </button>

      </div>
    </div>
  );
}
