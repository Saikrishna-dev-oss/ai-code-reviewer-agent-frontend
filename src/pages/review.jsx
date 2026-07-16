// src/pages/review.jsx
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown'; 
import { fetchAiReview } from '../services/api'; 
import './review.css';

export default function Review({ files, onReset }) {
  const [loading, setLoading] = useState(true);
  const [aiResponse, setAiResponse] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const getReviewData = async () => {
      try {
        setLoading(true);
        setAiResponse({ review: "" }); // Clear previous text

        // Passing our onChunk callback to catch the streaming text
        await fetchAiReview(files, (streamedText) => {
          setLoading(false); // Turning off spinner as soon as typing begins
          setAiResponse({ review: streamedText });
        });

      } catch (err) {
        setError(err.message);
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
          <h2>AI Architectural Review</h2>
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
            <span className="output-label">
              {aiResponse?.status === 'mock' ? 'Agent Output (Mock Mode)' : 'Agent Output'}
            </span>
            
            {/*ReactMarkdown handle the string parsing */}
            <div className="output-text markdown-container">
              <ReactMarkdown>
                {aiResponse?.review || 'No review data returned.'}
              </ReactMarkdown>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}