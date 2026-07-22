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
    const response = await fetch(`${API_BASE_URL}/api/ingest/github`, {
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

/**
 * Sends a single file's code and chat history to the AI for interactive Q&A.
 * @param {string} fileName - The name of the active file.
 * @param {string} content - The code content of the file.
 * @param {Array} chatHistory - The array of previous messages.
 * @returns {Promise<Object>} - The AI response object { sender, text }.
 */
export const fetchFileChat = async (fileName, content, chatHistory) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/review/file`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        fileName, 
        content, 
        chatHistory 
      }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    return data; // Returns { sender: "Agent", text: "..." }
  } catch (error) {
    console.error("Chat Fetch Error:", error);
    throw new Error('Failed to send chat message.', { cause: error });
  }
};