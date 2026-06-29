// src/pages/review.jsx
import { useState, useEffect } from 'react';
import './review.css';

export default function Review({ files, onReset }) {
  const [loading, setLoading] = useState(true);
  const [aiResponse, setAiResponse] = useState(null);
  const [error, setError] = useState('');

  // 1. Trigger the API call as soon as this component mounts
  useEffect(() => {
    const fetchReview = async () => {
      try {
        // Ensure your FastAPI backend is running on port 8000!
        const response = await fetch('http://localhost:8000/review', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // We send the list of extracted files to the backend
          body: JSON.stringify({ files: files })
        });

        if (!response.ok) {
          throw new Error('Failed to communicate with AI Agent');
        }

        const data = await response.json();
        setAiResponse(data);
        
      } catch (err) {
        console.error("Network Error:", err);
        setError("Could not connect to the backend. Is your FastAPI server running?");
      } finally {
        // Add a fake 1.5-second delay just so you can see the cool loading spinner
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      }
    };

    fetchReview();
  }, [files]); // The empty dependency array ensures this only runs once

  return (
    <div className="review-wrapper">
      <div className="review-card">
        
        <div className="review-header">
          <h2>AI Review Results</h2>
          <button className="reset-btn" onClick={onReset}>
            Review Another Project
          </button>
        </div>

        <div className="file-summary">
          Targeting {files.length} source files for analysis.
        </div>

        {/* Dynamic UI Rendering based on Network State */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Analyzing codebase architecture...</p>
          </div>
        ) : error ? (
          <div className="output-box" style={{ borderColor: '#ef4444' }}>
            <span className="output-label" style={{ color: '#ef4444' }}>Connection Error</span>
            <div className="output-text" style={{ color: '#ef4444' }}>{error}</div>
          </div>
        ) : (
          <div className="output-box">
            <span className="output-label">Agent Output</span>
            <div className="output-text">
              {/* Displaying the JSON response from your FastAPI backend */}
              {JSON.stringify(aiResponse, null, 2)}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}