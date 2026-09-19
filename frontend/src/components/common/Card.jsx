import React from 'react';
import './common.css';

export const Card = ({ children, className = '', noPadding = false, ...props }) => {
  return (
    <div 
      className={`custom-card ${noPadding ? 'no-padding' : ''} ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};
