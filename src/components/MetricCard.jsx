import React from 'react';

export default function MetricCard({ label, value, iconType }) {
  // Define icons based on type to match the reference design
  const renderIcon = () => {
    switch (iconType) {
      case 'courses':
        return (
          <div className="metric-icon-box icon-indigo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </div>
        );
      case 'evaluations':
        return (
          <div className="metric-icon-box icon-cyan">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4"></path>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
          </div>
        );
      case 'progress':
        return (
          <div className="metric-icon-box icon-green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
              <polyline points="16 7 22 7 22 13"></polyline>
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="metric-card">
      {renderIcon()}
      <div className="metric-content">
        <h4>{label}</h4>
        <div className="value">{value}</div>
      </div>
    </div>
  );
}
