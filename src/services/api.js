// src/services/api.js

const API_BASE_URL = 'http://localhost:8000';

/**
 * Sends the extracted code files to the FastAPI backend for AI review.
 * @param {Array} files - Array of { fileName, code } objects.
 * @returns {Promise<Object>} - The AI JSON response.
 */
export const fetchAiReview = async (files, onChunk) => {
  try {
    const normalizedFiles = files.map(f => ({
      fileName: f.fileName || f.name || "Unknown File",
      content: f.content || f.code || "// No content",
      category: f.category || "Uncategorized",
      loc: Number(f.loc) || Number(f.linesOfCode) || 0
    }));

    const response = await fetch(`${API_BASE_URL}/api/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ files: normalizedFiles }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }

    // 🚀THE STREAM READER
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break; // Stream is finished
      
      // Decode the byte array into a string chunk
      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;
      
      // Fire the callback to update the UI instantly
      onChunk(fullText);
    }
    
    return fullText; 
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch AI review from backend.', { cause: error });
  }
};

export const ingestGitHubRepo = async (repoUrl) => {
  try {
    const response = await fetch('http://localhost:8000/api/ingest/github', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ repoUrl }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to ingest repository from GitHub');
    }

    return await response.json();
  } catch (error) {
    console.error("GitHub Ingestion Error:", error);
    throw error;
  }
};