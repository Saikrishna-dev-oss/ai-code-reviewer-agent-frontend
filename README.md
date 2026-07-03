# 🧠 AI-Code Reviewer Agent

A full-stack, end-to-end application designed to ingest, categorize, and visually analyze software repositories before submitting them for an AI-driven code review. 

This project was built with a strict focus on first-principles engineering, modular architecture, and premium user experience (UX).

## ✨ Core Features

### 🛡️ Secure User Management
* **Authentication Pipeline:** Full Login and Registration flow utilizing a local `json-server` mock database.
* **Profile Management:** Users can upload profile avatars. 
* **Client-Side Optimization:** Implemented HTML5 `<canvas>` compression to resize and compress profile images in the browser before sending to the database, bypassing standard payload limits.

### 📦 Zero-Friction Code Ingestion
* **True Drag-and-Drop:** Native HTML5 drag-and-drop file support with visual hover feedback.
* **In-Memory Extraction:** Utilizes `JSZip` to decompress user `.zip` files entirely within the browser's memory, completely eliminating the risk of crashing the backend server with massive file payloads.

### 📊 Architectural Dashboard
* **Dynamic Visualization:** Uses `Recharts` to generate an interactive donut chart breaking down the codebase by file type (e.g., Backend Scripts, UI Components).
* **Deep Metrics:** Calculates total lines of code (LOC) and provides a scrollable, nested view of the ingested file directory.
* **State Machine Routing:** A tightly controlled React state machine that routes the user gracefully from upload, to analysis, to the final AI review.

### 🔗 FastAPI Backend Integration
* **RESTful Architecture:** Cleanly separated `src/services/api.js` layer managing network requests to a Python-based FastAPI backend.
* **Scalable AI Endpoint:** Backend prepared to receive parsed repository architectures and return AI-generated code reviews.

---

## 🛠️ Technology Stack

**Frontend (UI)**
* React.js (Vite)
* JSZip (Client-side memory decompression)
* Recharts (Data visualization)
* Scoped CSS Architecture

**Backend (API)**
* Python 3
* FastAPI
* Uvicorn (ASGI Server)

**Database / Mock API**
* JSON Server (REST API for Users)

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

### 2. Start the Mock Database (Terminal 2)
This runs the local JSON server to handle user login and registration data.
```bash
# Clone the frontend repository
git clone https://github.com/Saikrishna-dev-oss/ai-code-reviewer-agent-frontend.git

# Navigate to your frontend directory
cd ai-code-reviewer-agent-frontend

# Start JSON server on port 5000
npx json-server --watch db.json --port 5000
```

### 3. Start the React Frontend (Terminal 3)
This runs the React frontend application.
```bash
# Navigate to your frontend directory
cd ai-code-reviewer-agent-frontend

# Install Node dependencies
npm install

# Start the development server
npm run dev
```

## 4. 📂 Architecture Overview
```
 FRONTEND/
├── node_modules/
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   │   ├── dashboard.jsx
│   │   ├── login.css
│   │   ├── login.jsx
│   │   ├── profile.css
│   │   ├── profile.jsx
│   │   ├── register.jsx
│   │   ├── review.css
│   │   ├── review.jsx
│   │   ├── upload.css
│   │   └── upload.jsx
│   ├── services/
│   │   └── api.js
│   ├── styles/
│   │   └── global.css
│   ├── util/
│   │   └── utilParser.js
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .gitignore
├── db.json
├── eslint.config.js
├── index.html
└── package-lock.json