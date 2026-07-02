// // Dashboard.jsx
// // -----------------------------
// // This component renders the "Architectural Analysis" dashboard after files are uploaded.
// // It provides metrics (file count, lines of code) and a pie chart visualization of file categories.
// // Includes UX, accessibility, and safety fixes for a smoother user experience.

import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './upload.css'; 

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#64748b'];

export default function Dashboard({ files, onProceed, onBack }) {
  
  // 1. Existing Pie Chart Data Calculation
  const chartData = useMemo(() => {
    if (!files || files.length === 0) return [];
    const counts = files.reduce((acc, file) => {
      acc[file.category] = (acc[file.category] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [files]);

  // 2. Existing Lines of Code Calculation
  const totalLoc = useMemo(() => {
    return files.reduce((acc, file) => {
      const code = typeof file.code === 'string' ? file.code : '';
      return acc + code.split('\n').length;
    }, 0);
  }, [files]);

  //  Calculate exact numerical breakdown by file extension
  const extensionBreakdown = useMemo(() => {
    if (!files || files.length === 0) return [];
    
    const counts = files.reduce((acc, file) => {
      // Safely split the filename by '.' to get the extension
      const parts = file.fileName.split('.');
      const ext = parts.length > 1 ? `.${parts.pop()}` : 'No Ext';
      
      acc[ext] = (acc[ext] || 0) + 1;
      return acc;
    }, {});

    // Convert to an array and sort it from highest count to lowest
    return Object.entries(counts)
      .map(([ext, count]) => ({ ext, count }))
      .sort((a, b) => b.count - a.count);
  }, [files]);

  if (!files || files.length === 0) {
    return (
      <div className="upload-wrapper" style={{ maxWidth: '800px' }}>
        <div className="upload-card">
          <h2>Architectural Analysis</h2>
          <div className="empty-state">
            <p>No valid source code files were detected in the upload.</p>
            <button onClick={onBack} className="submit-btn" style={{ marginTop: '16px' }}>
              ← Return to Upload
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="upload-wrapper" style={{ maxWidth: '900px' }}> {/* Slightly widened to fit the new data */}
      <div className="upload-card">
        
        {/* Header */}
        <div className="upload-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Architectural Analysis</h2>
            <p>Codebase categorization complete.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={onBack} style={{ background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer' }}>
              ← Back
            </button>
            <button onClick={onProceed} className="submit-btn" style={{ width: 'auto', padding: '10px 24px' }}>
              Execute AI Review →
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="dashboard-metrics-row">
          <div className="metric-card">
            <span className="metric-label">Total Files</span>
            <span className="metric-value">{files.length}</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Approx. Lines of Code</span>
            <span className="metric-value" style={{ color: 'var(--primary-accent)' }}>{totalLoc.toLocaleString()}</span>
          </div>
        </div>

        {/* I split the bottom section into a CSS Grid: 
          Left side = Pie Chart, Right side = Detailed Breakdowns 
        */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          {/* Left Column: The Recharts Donut */}
          <div className="chart-container" style={{ height: 'auto', minHeight: '350px' }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData} cx="50%" cy="50%" innerRadius={70} outerRadius={100}
                  paddingAngle={5} dataKey="value" stroke="none" isAnimationActive={true}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} itemStyle={{ color: 'var(--text-main)' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Right Column: The New File Structure Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* 🚀 NEW UI 1: Numerical Type Breakdown Grid */}
            <div style={{ backgroundColor: 'var(--bg-dark)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '16px' }}>
              <h3 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>File Type Breakdown</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px' }}>
                {extensionBreakdown.map((item) => (
                  <div key={item.ext} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-main)', fontSize: '13px' }}>{item.ext}</span>
                    <span style={{ color: 'var(--primary-accent)', fontWeight: 'bold', fontSize: '13px' }}>{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Repository Structure Explorer */}
            <div style={{ backgroundColor: 'var(--bg-dark)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ingested Repository Structure</h3>
              
              {/* Scrollable container for the file tree */}
              <div style={{ flex: 1, maxHeight: '180px', overflowY: 'auto', paddingRight: '8px' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {files.map((f, i) => (
                    <li key={i} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {/* fontFamily: monospace makes it look like real code structure */}
                      <span style={{ fontFamily: 'monospace', wordBreak: 'break-all', paddingRight: '12px' }}>{f.fileName}</span>
                      <span style={{ flexShrink: 0, fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-accent)' }}>
                        {f.category}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}