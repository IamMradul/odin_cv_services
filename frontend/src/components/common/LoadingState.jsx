import React from 'react';
import './common.css';

export const LoadingState = ({ rows = 3, variant = 'card' }) => {
  if (variant === 'spinner') {
    return (
      <div className="loading-spinner-container">
        <div className="loading-spinner" />
        <span className="loading-label">Loading…</span>
      </div>
    );
  }

  return (
    <div className="skeleton-list">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-row">
          <div className="skeleton skeleton-card" style={{ height: variant === 'table' ? 44 : 90 }} />
        </div>
      ))}
    </div>
  );
};
