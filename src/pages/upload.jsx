// src/pages/upload.jsx
import { useState, useRef } from 'react';
import { extractCodeFiles } from '../util/utilParser'; 
import { ingestGitHubRepo } from '../services/api'; // Make sure this path is correct!
import './upload.css';
import { FaGithub } from "react-icons/fa";

// Add this helper function at the top, outside the main component
const determineCategory = (fileName) => {
  // Edge Case: Files without extensions (like Dockerfile or LICENSE)
  if (!fileName.includes('.')) {
    if (fileName.toLowerCase().includes('license')) return 'Legal / Licensing';
    if (fileName.toLowerCase().includes('docker')) return 'DevOps / Config';
    return 'System File';
  }

  const ext = fileName.split('.').pop().toLowerCase();
  
  // Test Case Coverage for standard extensions
  switch (ext) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
    case 'css':
    case 'html':
      return 'Frontend / UI';
    case 'py':
    case 'java':
    case 'cpp':
    case 'c':
    case 'go':
    case 'rs':
      return 'Backend / Logic';
    case 'json':
    case 'yaml':
    case 'yml':
    case 'env':
    case 'gitignore':
    case 'toml':
      return 'Configuration';
    case 'md':
    case 'txt':
      return 'Documentation';
    case 'sql':
    case 'db':
      return 'Database / Schema';
    case 'sh':
    case 'bat':
      return 'Scripts';
    default:
      return 'Other Assets';
  }
};
export default function Upload({ onFilesProcessed }) {
  // 🚀 Core State
  const [activeTab, setActiveTab] = useState('zip'); // 'zip' or 'github'
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedFiles, setExtractedFiles] = useState([]);
  const [error, setError] = useState('');
  
  // Zip State
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // GitHub State
  const [githubUrl, setGithubUrl] = useState('');

  // -------------------------------------------------------------
  // 1. ZIP / LOCAL FILE LOGIC
  // -------------------------------------------------------------
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

  const handleFileChange = (event) => {
    processSelectedFile(event.target.files[0]);
  };

  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

// -------------------------------------------------------------
  // 2. GITHUB IMPORT LOGIC
  // -------------------------------------------------------------
  const handleGithubSubmit = async (e) => {
    e.preventDefault();
    if (!githubUrl.trim()) return;

    setIsProcessing(true);
    setError('');
    setExtractedFiles([]); 

    try {
      const response = await ingestGitHubRepo(githubUrl);
      
      const mappedFiles = response.files.map(file => {
        const safeContent = typeof file.content === 'string' ? file.content : "// No content extracted";
        const calculatedLines = safeContent.split(/\r\n|\r|\n/).length;
        
        return {
          fileName: file.path,
          
          // 🚀 THE FIX: Provide BOTH property names so Zip parsers and GitHub parsers align perfectly
          content: safeContent, 
          code: safeContent,    
          
          category: determineCategory(file.path),
          lines: calculatedLines,
          loc: calculatedLines,
          linesOfCode: calculatedLines,
          size: file.size
        };
      });

      setExtractedFiles(mappedFiles);
    } catch (err) {
      setError(err.message || 'Failed to ingest repository from GitHub');
    } finally {
      setIsProcessing(false);
    }
  };

  // -------------------------------------------------------------
  // 3. PROCEED TO DASHBOARD
  // -------------------------------------------------------------
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

        {/* 🚀 NEW: UI Toggle Tabs */}
        <div className="upload-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            onClick={() => { setActiveTab('zip'); setError(''); }}
            style={{ 
              flex: 1, 
              padding: '10px', 
              background: activeTab === 'zip' ? 'var(--primary-accent)' : 'transparent',
              color: activeTab === 'zip' ? '#fff' : 'var(--text-main)',
              border: '1px solid var(--primary-accent)',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            📁 Upload.zip
          </button>
          <button 
            onClick={() => { setActiveTab('github'); setError(''); }}
            style={{ 
              flex: 1, 
              padding: '10px', 
              background: activeTab === 'github' ? 'var(--primary-accent)' : 'transparent',
              color: activeTab === 'github' ? '#fff' : 'var(--text-main)',
              border: '1px solid var(--primary-accent)',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            <FaGithub style={{ marginRight: "6px" }} />
            Import from GitHub
          </button>

        </div>

        {/* RENDER ZIP UI */}
        {activeTab === 'zip' && (
          <>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="file-input" 
              accept=".zip,.py,.js,.jsx,.sql" 
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
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
                  <p>{isDragging ? 'Drop archive to ingest!' : 'Click to browse or drag a file here'}</p>
                  <span style={{ color: 'var(--text-muted)' }}>Accepts .zip, .py, .js, .jsx, .sql</span>
                </>
              )}
            </div>
          </>
        )}

        {/* RENDER GITHUB UI */}
        {activeTab === 'github' && (
          <form onSubmit={handleGithubSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input 
              type="text" 
              placeholder="e.g., Saikrishna-dev-oss/ai-code-reviewer-agent-backend"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              disabled={isProcessing}
              style={{
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-dark)',
                color: 'var(--text-main)'
              }}
            />
            <button 
              type="submit" 
              disabled={isProcessing || !githubUrl.trim()}
              style={{
                padding: '12px',
                borderRadius: '6px',
                background: 'var(--primary-accent)',
                color: '#fff',
                border: 'none',
                cursor: (isProcessing || !githubUrl.trim()) ? 'not-allowed' : 'pointer',
                opacity: (isProcessing || !githubUrl.trim()) ? 0.7 : 1
              }}
            >
              {isProcessing ? 'Fetching Architecture...' : 'Fetch Repository'}
            </button>
          </form>
        )}

        {/* Error Output */}
        {error && <p style={{ color: '#ef4444', marginTop: '16px', fontSize: '14px' }}>{error}</p>}

        {/* Dynamic File Tree Preview */}
        {extractedFiles.length > 0 && (
          <div className="file-preview" style={{ marginTop: '20px' }}>
            <h3>Detected {extractedFiles.length} files</h3>
            <ul className="file-list">
              {extractedFiles.slice(0, 50).map((fileObj, index) => (
                <li 
                  key={index} 
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span>{fileObj.fileName}</span>
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
          style={{ marginTop: '20px' }}
        >
          Proceed to Architectural Dashboard →
        </button>

      </div>
    </div>
  );
}