// src/pages/upload.jsx
import { useState, useRef } from 'react';
import JSZip from 'jszip';
import './upload.css';

export default function Upload({ onFilesProcessed }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedFiles, setExtractedFiles] = useState([]);
  const [error, setError] = useState('');
  
  // A reference to trigger the hidden HTML file input when the dropzone is clicked
  const fileInputRef = useRef(null);

  // 1. Handle the file selection
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError('');
    setIsProcessing(true);

    try {
      // If it is a ZIP file, extract its contents
        if (file.name.endsWith('.zip')) {
        await processZipFile(file);
      } 
      // If it is a single code file (.py, .js, .sql)
        else if (file.name.match(/\.(py|js|jsx|sql)$/)) {
        const content = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (err) => reject(err);
            reader.readAsText(file);
        });

        setExtractedFiles([{ fileName: file.name, code: content }]);
        }

        else {
        setError('Unsupported file type. Please upload a .zip or source code file.');
        setExtractedFiles([]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to process file. Ensure it is a valid archive.');
    } finally {
      setIsProcessing(false);
    }
  };

const processZipFile = async (file) => {
    const zip = new JSZip();
    const loadedZip = await zip.loadAsync(file);
    const fileDataList = [];

    // We need to wait for all files to be read asynchronously
    const promises = [];

    loadedZip.forEach((relativePath, zipEntry) => {
      // Ignore folders, macOS hidden files, and standard hidden files
      if (!zipEntry.dir && !relativePath.startsWith('__MACOSX') && !relativePath.includes('/.')) {
        
        // Create a promise to read the text content of the file
        const promise = zipEntry.async("string").then((content) => {
          fileDataList.push({
            fileName: relativePath,
            code: content // This is the actual raw source code!
          });
        });
        
        promises.push(promise);
      }
    });

    // Wait for all files to finish extracting
    await Promise.all(promises);
    
    // Save the rich data to state
    setExtractedFiles(fileDataList);
  };

  // 3. Trigger the transition to the Review screen
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

        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="file-input" 
          accept=".zip,.py,.js,.jsx,.sql" 
          onChange={handleFileChange}
        />

        {/* Clickable Dropzone */}
        <div 
          className="dropzone" 
          onClick={() => fileInputRef.current.click()}
        >
          {isProcessing ? (
            <p>Processing Archive...</p>
          ) : (
            <>
              <p>Click to browse or drag a file here</p>
              <span>Accepts .zip, .py, .js, .jsx, .sql</span>
            </>
          )}
        </div>

        {/* Error State */}
        {error && <p style={{ color: '#ef4444', marginBottom: '16px', fontSize: '14px' }}>{error}</p>}

        {/* Dynamic File Tree Preview */}
        {extractedFiles.length > 0 && (
          <div className="file-preview">
            <h3>Detected {extractedFiles.length} files</h3>
            <ul className="file-list">
              {extractedFiles.slice(0, 50).map((fileObj, index) => (
                <li key={index}>{fileObj.fileName}</li>
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