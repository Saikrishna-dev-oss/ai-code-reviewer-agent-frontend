# 🎨 AI-Code Reviewer Agent (Frontend)

A full-stack, end-to-end application designed to ingest, categorize, and visually analyze software repositories before submitting them for an AI-driven code review. 

This project was built with a strict focus on first-principles engineering, modular architecture, and a production-grade user experience.

## ✨ Core Features

### 🛡️ Secure User Management
* **Authentication Pipeline:** Full Login and Registration flow utilizing a secure, local SQLite database with SHA-256 cryptographic salting and hashing.
* **Profile Management:** Users can upload profile avatars seamlessly. 
* **Client-Side Optimization:** Implemented HTML5 `<canvas>` compression to resize and compress profile images in the browser before sending to the database, bypassing standard network payload limits.

### 📦 Zero-Friction Code Ingestion
* **Dual Ingestion Engine:** Supports direct GitHub repository URL ingestion alongside native HTML5 drag-and-drop file support with reactive visual hover feedback.
* **In-Memory Extraction:** Utilizes `JSZip` to decompress user `.zip` files entirely within the browser's memory, completely eliminating the risk of crashing the backend server with massive file payloads.

### 📊 Architectural Dashboard
* **Dynamic Visualization:** Uses `Recharts` to generate an interactive donut chart breaking down the codebase by file type (e.g., Backend Scripts, UI Components).
* **Deep Metrics:** Calculates total lines of code (LOC) and provides a scrollable, nested view of the ingested file directory structure.
* **State Machine Routing:** A tightly controlled React state machine that routes the user gracefully from upload, to analysis, to the final AI review response, bypassing heavy external routing libraries.

### 💻 Immersive 3-Pane IDE & AI Chat
* **Production-Grade Interface:** Features a recursive file tree explorer alongside a syntax-highlighted Monaco Editor synced to the active file.
* **Interactive AI Review:** A dedicated chat pane for line-by-line AI code analysis and Q&A.
* **Markdown & Syntax Highlighting:** AI responses are beautifully formatted in the chat interface using `react-markdown` and `react-syntax-highlighter` for crisp, readable code blocks.
* **Persistent Theming:** Seamless Light/Dark mode toggling tied to local storage for a persistent user experience across sessions.

### 🔗 FastAPI Backend Integration
* **RESTful Architecture:** Cleanly separated `src/services/api.js` network layer managing async streams and API payloads to a Python-based FastAPI backend.
* **Robust Middlewares & Logging:** Built-in global exception filters and a custom SQLite logging handler that tracks API response times and errors chronologically.

---

## 🛠️ Technology Stack

**Frontend (UI)**
* React.js (Vite)
* `@monaco-editor/react` (Code editor integration)
* `recharts` (Data visualization)
* `JSZip` (Client-side memory decompression)
* `react-markdown` & `react-syntax-highlighter` (Chat formatting)
* Scoped CSS Architecture

**Backend (API & Database)**
* Python 3
* FastAPI & Uvicorn
* SQLite3 (Embedded Database with custom application logging framework)
---

---
## 🚀 Local Installation & Setup

Because this project uses a decoupled, microservice-style architecture, the Frontend and Backend are hosted in separate repositories. You will need to clone both to run the full application locally.

### Prerequisites
* [Git](https://git-scm.com/) installed
* [Node.js](https://nodejs.org/) installed
* [Python 3.8+](https://www.python.org/) installed

### 1. Start the FastAPI Backend (Terminal 1)
First, clone and start the AI backend server.

```bash
# Clone the backend repository
git clone https://github.com/Saikrishna-dev-oss/ai-code-reviewer-agent-backend.git

cd ai-code-reviewer-agent-backend

# Install dependencies
pip install fastapi uvicorn

# Start the server on port 8000
uvicorn main:app --reload
```


### 2. Start the React Frontend (Terminal 2)
This runs the React frontend application.
```bash
# Navigate to your frontend directory
cd ai-code-reviewer-agent-frontend

# Install Node dependencies
npm install

# Start the development server
npm run dev
```

## 📂 Architecture Overview
```
FRONTEND/
├── node_modules/
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   │   ├── codeReviewer.css   # Replaced review.css
│   │   ├── codeReviewer.jsx   # 3-Pane IDE & Chat Interface
│   │   ├── dashboard.jsx      # Architectural Analytics
│   │   ├── login.css
│   │   ├── login.jsx
│   │   ├── profile.css
│   │   ├── profile.jsx
│   │   ├── register.jsx
│   │   ├── upload.css
│   │   └── upload.jsx         # ZIP & GitHub URL ingestion
│   ├── services/
│   │   └── api.js             # API bridges for backend & chat
│   ├── styles/
│   │   └── global.css
│   ├── util/
│   │   └── utilParser.js
│   ├── App.css
│   ├── App.jsx                
│   ├── index.css
│   └── main.jsx
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
└── package-lock.json
```

## 📜 LICENSE

This Project is under the MIT License. See the [LICENSE](LICENSE) file for details.
