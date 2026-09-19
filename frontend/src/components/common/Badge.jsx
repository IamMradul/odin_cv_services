import React from 'react';
import './common.css';

const VARIANTS = {
  success: 'badge-success',
  critical: 'badge-critical',
  warning: 'badge-warning',
  info: 'badge-info',
  offline: 'badge-offline',
  processing: 'badge-processing',
  neutral: 'badge-neutral',
  new: 'badge-new',
  acknowledged: 'badge-acknowledged',
  investigating: 'badge-investigating',
  resolved: 'badge-resolved',
};

export const Badge = ({ variant = 'neutral', children, className = '', dot = false }) => {
  const cls = VARIANTS[variant] || VARIANTS.neutral;
  return (
    <span className={`badge ${cls} ${className}`}>
      {dot && <span className="badge-dot" />}
      {children}
    </span>
  );
};
