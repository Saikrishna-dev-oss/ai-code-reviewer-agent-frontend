// Dashboard.jsx
// -----------------------------
// This component renders the "Architectural Analysis" dashboard after files are uploaded.
// It provides metrics (file count, lines of code) and a pie chart visualization of file categories.
// Includes UX, accessibility, and safety fixes for a smoother user experience.

import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './upload.css'; 

// Define a consistent color palette for chart slices
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#64748b'];

export default function Dashboard({ files, onProceed, onBack }) {
  
  // Memoized chart data: counts how many files belong to each category
  const chartData = useMemo(() => {
    if (!files || files.length === 0) return [];

    const counts = files.reduce((acc, file) => {
      acc[file.category] = (acc[file.category] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    }));
  }, [files]);

  // Memoized LOC calculation: ensures safe handling if file.code is not a string
  const totalLoc = useMemo(() => {
    return files.reduce((acc, file) => {
      const code = typeof file.code === 'string' ? file.code : '';
      return acc + code.split('\n').length;
    }, 0);
  }, [files]);

  // Graceful fallback UI if no files are detected
  if (!files || files.length === 0) {
    return (
      <div className="upload-wrapper" style={{ maxWidth: '800px' }}>
        <div className="upload-card">
          <h2>Architectural Analysis</h2>
          <div className="empty-state">
            <p>No valid source code files were detected in the upload.</p>
            {/* Escape hatch: allow user to go back */}
            <button onClick={onBack} className="submit-btn" style={{ marginTop: '16px' }}>
              ← Return to Upload
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="upload-wrapper" style={{ maxWidth: '800px' }}>
      <div className="upload-card">
        
        {/* Header with navigation buttons */}
        <div className="upload-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Architectural Analysis</h2>
            <p>Codebase categorization complete.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {/* Back button wired to onBack prop */}
            <button 
              onClick={onBack} 
              style={{ background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer' }}
            >
              ← Back
            </button>
            {/* Proceed button triggers AI review */}
            <button onClick={onProceed} className="submit-btn" style={{ width: 'auto', padding: '10px 24px' }}>
              Execute AI Review →
            </button>
          </div>
        </div>

        {/* Metrics row: total files and LOC */}
        <div className="dashboard-metrics-row">
          <div className="metric-card">
            <span className="metric-label">Total Files</span>
            <span className="metric-value">{files.length}</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Approx. Lines of Code</span>
            {/* Format large numbers with commas for readability */}
            <span className="metric-value" style={{ color: 'var(--primary-accent)' }}>{totalLoc.toLocaleString()}</span>
          </div>
        </div>

        {/* Pie chart visualization of file categories */}
        {/* Accessibility: aria-label added for screen readers */}
        <div className="chart-container" aria-label="A pie chart displaying the distribution of file types in the uploaded codebase.">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
                isAnimationActive={true} // Smooth animation enabled
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`} // Inline percentage labels
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              {/* Tooltip styled to match app theme */}
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                itemStyle={{ color: 'var(--text-main)' }}
              />
              {/* Legend displayed at bottom with circle icons */}
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}
