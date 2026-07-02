// src/pages/review.jsx
import { useState, useEffect } from 'react';
import { fetchAiReview } from '../services/api'; // Import network service
import './review.css';

export default function Review({ files, onReset }) {
  const [loading, setLoading] = useState(true);
  const [aiResponse, setAiResponse] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // We define an async function inside useEffect to handle the network call
    const getReviewData = async () => {
      try {
        setLoading(true);
        // We call our clean abstracted service here
        const data = await fetchAiReview(files);
        setAiResponse(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (files && files.length > 0) {
      getReviewData();
    }
  }, [files]); 

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
              {JSON.stringify(aiResponse, null, 2)}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}