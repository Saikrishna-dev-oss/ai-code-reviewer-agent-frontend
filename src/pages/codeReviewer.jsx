// src/pages/CodeReviewer.jsx
import { useState, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { fetchFileChat } from '../services/api';
import './CodeReviewer.css';

import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// 1. Helper to detect language from file extension
const getLanguageFromExtension = (fileName) => {
  if (!fileName) return 'javascript';
  const ext = fileName.split('.').pop().toLowerCase();
  
  const languageMap = {
    py: 'python',
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    json: 'json',
    html: 'html',
    css: 'css',
    java: 'java',
    c: 'c',
    cpp: 'cpp'
  };
  
  return languageMap[ext] || 'plaintext';
};

// 2. The Tree Builder Algorithm
const buildFileTree = (files) => {
  const root = { name: 'root', type: 'folder', children: {} };

  files.forEach((file, index) => {
    const pathParts = (file.fileName || file.name).split('/');
    let currentNode = root;

    pathParts.forEach((part, i) => {
      if (i === pathParts.length - 1) {
        currentNode.children[part] = { name: part, type: 'file', index, fileObj: file };
      } else {
        if (!currentNode.children[part]) {
          currentNode.children[part] = { name: part, type: 'folder', children: {} };
        }
        currentNode = currentNode.children[part];
      }
    });
  });

  return root;
};

// 3. The Recursive Tree Node Component
const FileTreeNode = ({ node, depth = 0, activeFileIndex, setActiveFileIndex }) => {
  const [isOpen, setIsOpen] = useState(true);

  const sortedChildren = useMemo(() => {
    if (!node.children) return [];
    return Object.values(node.children).sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'folder' ? -1 : 1;
    });
  }, [node.children]);

  if (node.type === 'file') {
    const isActive = activeFileIndex === node.index;
    return (
      <div 
        className={`tree-item tree-file ${isActive ? 'active' : ''}`}
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
        onClick={() => setActiveFileIndex(node.index)}
      >
        <span className="tree-icon file-icon">📄</span>
        <span className="tree-name" title={node.name}>{node.name}</span>
      </div>
    );
  }

  if (node.type === 'folder' && node.name !== 'root') {
    return (
      <div>
        <div 
          className="tree-item tree-folder"
          style={{ paddingLeft: `${depth * 16 + 4}px` }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={`folder-caret ${isOpen ? 'open' : ''}`}>▶</span>
          <span className="tree-icon folder-icon">{isOpen ? '📂' : '📁'}</span>
          <span className="tree-name" title={node.name}>{node.name}</span>
        </div>
        {isOpen && sortedChildren.map(child => (
          <FileTreeNode 
            key={child.name} 
            node={child} 
            depth={depth + 1} 
            activeFileIndex={activeFileIndex}
            setActiveFileIndex={setActiveFileIndex}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="file-tree-root">
      {sortedChildren.map(child => (
        <FileTreeNode 
          key={child.name} 
          node={child} 
          depth={0} 
          activeFileIndex={activeFileIndex}
          setActiveFileIndex={setActiveFileIndex}
        />
      ))}
    </div>
  );
};

// 4. Main Component
export default function CodeReviewer({ files = [], onExit, theme }) {
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  
  // 🚀 React State for Chat Memory
  const [chatHistories, setChatHistories] = useState({});
  const [currentInput, setCurrentInput] = useState('');

  const activeFile = files.length > 0 ? files[activeFileIndex] : null;
  const fileTree = useMemo(() => buildFileTree(files), [files]);
  
  // Safely get the chat history for the currently active file
  const currentChat = chatHistories[activeFileIndex] || [];

  const handleSendMessage = async () => {
    if (!currentInput.trim() || !activeFile) return; 

    // 1. Capture the text and clear the input box immediately for a snappy UI
    const userText = currentInput;
    const newMessage = { sender: 'You', text: userText };
    setCurrentInput(''); 

    // 2. Update the UI with your message AND a temporary "Typing..." bubble
    const loadingMessage = { sender: 'Agent', text: 'Typing...' };
    
    setChatHistories(prev => ({
      ...prev,
      [activeFileIndex]: [...(prev[activeFileIndex] || []), newMessage, loadingMessage]
    }));

    try {
      // 3. Package the history (making sure to include the message you just sent)
      const currentHistory = chatHistories[activeFileIndex] || [];
      const historyToSend = [...currentHistory, newMessage];

      // 4. Fire the request using our clean API bridge
      const data = await fetchFileChat(
        activeFile.fileName || activeFile.name,
        activeFile.content || activeFile.code || '',
        historyToSend
      );

      // 5. Remove the "Typing..." bubble and replace it with the backend's response
      setChatHistories(prev => {
        const hist = prev[activeFileIndex] || [];
        const historyWithoutLoading = hist.slice(0, -1); 
        
        return {
          ...prev,
          [activeFileIndex]: [...historyWithoutLoading, { sender: data.sender, text: data.text }]
        };
      });

    } catch (error) {
      console.error("Failed to send message:", error);
      
      setChatHistories(prev => {
        const hist = prev[activeFileIndex] || [];
        const historyWithoutLoading = hist.slice(0, -1);
        return {
          ...prev,
          [activeFileIndex]: [...historyWithoutLoading, { sender: 'System', text: '❌ Error: Could not connect to the local FastAPI server.' }]
        };
      });
    }
  };
  // const handleSendMessage = async () => {
  //   if (!currentInput.trim() || !activeFile) return; 

  //   // 1. Capture the text and clear the input box immediately for a snappy UI
  //   const userText = currentInput;
  //   const newMessage = { sender: 'You', text: userText };
  //   setCurrentInput(''); 

  //   // 2. Update the UI with your message AND a temporary "Typing..." bubble
  //   const loadingMessage = { sender: 'Agent', text: 'Typing...' };
    
  //   setChatHistories(prev => ({
  //     ...prev,
  //     [activeFileIndex]: [...(prev[activeFileIndex] || []), newMessage, loadingMessage]
  //   }));

  //   try {
  //     // 3. Package the history (making sure to include the message you just sent)
  //     const currentHistory = chatHistories[activeFileIndex] || [];
  //     const historyToSend = [...currentHistory, newMessage];

  //     // 4. Fire the request to FastAPI
  //     const response = await fetch('http://localhost:8000/api/review/file', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         fileName: activeFile.fileName || activeFile.name,
  //         content: activeFile.content || activeFile.code || '',
  //         chatHistory: historyToSend 
  //       }),
  //     });

  //     if (!response.ok) throw new Error('Network response was not ok');
      
  //     const data = await response.json();

  //     // 5. Remove the "Typing..." bubble and replace it with the backend's response
  //     setChatHistories(prev => {
  //       const hist = prev[activeFileIndex] || [];
  //       const historyWithoutLoading = hist.slice(0, -1); 
        
  //       return {
  //         ...prev,
  //         [activeFileIndex]: [...historyWithoutLoading, { sender: data.sender, text: data.text }]
  //       };
  //     });

  //   } catch (error) {
  //     console.error("Failed to send message:", error);
      
  //     setChatHistories(prev => {
  //       const hist = prev[activeFileIndex] || [];
  //       const historyWithoutLoading = hist.slice(0, -1);
  //       return {
  //         ...prev,
  //         [activeFileIndex]: [...historyWithoutLoading, { sender: 'System', text: '❌ Error: Could not connect to the local FastAPI server.' }]
  //       };
  //     });
  //   }
  // };

  const handleRequestReview = async () => {
    if (!activeFile) return;

    // 1. Instantly show a loading message in the chat
    const loadingMessage = { sender: 'Agent', text: `Analyzing ${activeFile.fileName || activeFile.name}... (Connecting to backend)` };
    
    setChatHistories(prev => ({
      ...prev,
      [activeFileIndex]: [...(prev[activeFileIndex] || []), loadingMessage]
    }));

    try {
      // 2. Fire the request using our clean API bridge
      const data = await fetchFileChat(
        activeFile.fileName || activeFile.name,
        activeFile.content || activeFile.code || '',
        chatHistories[activeFileIndex] || [] // Send the previous chat history
      );

      // 3. Swap the loading message with the real AI response
      setChatHistories(prev => {
        const currentHistory = prev[activeFileIndex] || [];
        const historyWithoutLoading = currentHistory.slice(0, -1); 
        
        return {
          ...prev,
          [activeFileIndex]: [...historyWithoutLoading, { sender: data.sender, text: data.text }]
        };
      });

    } catch (error) {
      console.error("Failed to fetch review:", error);
      
      setChatHistories(prev => {
        const currentHistory = prev[activeFileIndex] || [];
        const historyWithoutLoading = currentHistory.slice(0, -1);
        return {
          ...prev,
          [activeFileIndex]: [...historyWithoutLoading, { sender: 'System', text: '❌ Error: Could not connect to the local FastAPI server.' }]
        };
      });
    }
  };

  return (
    <div className="reviewer-layout">
      {/* PANE 1: File Explorer */}
      <div className="pane file-explorer">
        <div className="pane-header">
          <h3>EXPLORER</h3>
          <button className="exit-btn" onClick={onExit}>Back</button>
        </div>
        <div className="file-list">
          {files.length > 0 ? (
            <FileTreeNode 
              node={fileTree} 
              activeFileIndex={activeFileIndex} 
              setActiveFileIndex={setActiveFileIndex} 
            />
          ) : (
            <p className="empty-msg">No files loaded.</p>
          )}
        </div>
      </div>

      {/* PANE 2: Monaco Editor */}
      <div className="pane code-editor">
        <div className="pane-header">
          <h3>{activeFile ? activeFile.fileName || activeFile.name : 'No file selected'}</h3>
        </div>
        <div className="editor-container">
          {activeFile ? (
            <Editor
              height="100%"
              theme={theme === 'light' ? 'light' : 'vs-dark'}
              language={getLanguageFromExtension(activeFile.fileName || activeFile.name)} 
              value={activeFile.content || activeFile.code || '// No content available'}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                readOnly: false,
              }}
            />
          ) : (
            <div className="empty-editor">Select a file to view its code.</div>
          )}
        </div>
      </div>

      {/* PANE 3: Review Thread */}
      <div className="pane review-thread">
        <div className="pane-header">
          <h3>AI Review & Comments</h3>
        </div>
        
        <div className="chat-history">
          {currentChat.length === 0 && (
             <div className="chat-message ai-message">
               <span className="message-sender">Agent</span>
               <div className="message-bubble">
                 Select a file and click "Request Review" to begin the analysis.
               </div>
             </div>
          )}

          {currentChat.map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.sender === 'Agent' ? 'ai-message' : 'user-message'}`}>
              <span className="message-sender">{msg.sender}</span>
              <div className="message-bubble">
                {msg.sender === 'Agent' ? (
                  <ReactMarkdown
                    components={{
                      code({inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <SyntaxHighlighter
                            {...props}
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{ borderRadius: '6px', margin: '8px 0', fontSize: '13px' }}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code {...props} className={className} style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '4px' }}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                ) : (
                  msg.text /* User messages remain plain text */
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="chat-input-area">
          <button className="action-btn request-btn" onClick={handleRequestReview}>
            Request AI Review
          </button>
          <div className="input-group">
            <textarea 
              placeholder="Add your own comments or notes here..."
              rows={2}
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            ></textarea>
            <button className="action-btn send-btn" onClick={handleSendMessage}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}