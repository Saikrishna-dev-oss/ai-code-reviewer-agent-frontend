// src/pages/upload.jsx
import { useState, useRef } from 'react';
import { extractCodeFiles } from '../util/utilParser'; 
import './upload.css';

export default function Upload({ onFilesProcessed }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedFiles, setExtractedFiles] = useState([]);
  const [error, setError] = useState('');
  
  // 🚀 NEW: State to track if a file is hovering over the dropzone
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef(null);

  // 1. Refactored Helper: Handles the file regardless of how it was uploaded (clicked or dragged)
  const processSelectedFile = async (file) => {
    if (!file) return;

    setError('');
    setIsProcessing(true);

    try {
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

  // 2. The Standard Click Handler
  const handleFileChange = (event) => {
    processSelectedFile(event.target.files[0]);
  };

  // 3. 🚀 The HTML5 Drag and Drop Handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true); // Turn on the visual highlight
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false); // Turn off the visual highlight
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // CRITICAL: We must prevent default here, otherwise the browser will open the .zip file in a new tab!
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false); // Turn off the highlight

    // Grab the dropped file from the OS and process it
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData(); // Clean up memory
    }
  };

  // 4. Trigger the transition to the Dashboard
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

        {/* Hidden file input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="file-input" 
          accept=".zip,.py,.js,.jsx,.sql" 
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {/* 🚀 Updated Dropzone with the 4 drag events and dynamic class */}
        <div 
          className={`dropzone ${isDragging ? 'drag-active' : ''}`} 
          onClick={() => fileInputRef.current.click()}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {isProcessing ? (
            <p style={{ color: 'var(--primary-accent)' }}>Decompressing Archive in Memory...</p>
          ) : (
            <>
              {/* Text changes dynamically when dragging! */}
              <p>{isDragging ? 'Drop archive to ingest!' : 'Click to browse or drag a file here'}</p>
              <span style={{ color: 'var(--text-muted)' }}>Accepts .zip, .py, .js, .jsx, .sql</span>
            </>
          )}
        </div>

        {error && <p style={{ color: '#ef4444', marginBottom: '16px', fontSize: '14px' }}>{error}</p>}

        {/* Dynamic File Tree Preview (Untouched) */}
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
          Proceed to Architectural Dashboard →
        </button>

      </div>
    </div>
  );
}
