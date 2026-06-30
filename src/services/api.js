// src/services/api.js

const API_BASE_URL = 'http://localhost:8000';

/**
 * Sends the extracted code files to the FastAPI backend for AI review.
 * @param {Array} files - Array of { fileName, code } objects.
 * @returns {Promise<Object>} - The AI JSON response.
 */
export const fetchAiReview = async (files) => {
  try {
    const response = await fetch(`${API_BASE_URL}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ files }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API Service Error:", error);
    throw new Error("Could not connect to the backend. Is your FastAPI server running?",{ cause: error });
  }
};