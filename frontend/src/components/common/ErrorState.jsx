import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import './common.css';

export const ErrorState = ({ message = 'Unable to load data.', onRetry }) => (
  <div className="error-state">
    <AlertCircle size={32} className="text-critical" />
    <p className="error-state-message">{message}</p>
    {onRetry && (
      <button className="btn btn-secondary" onClick={onRetry}>
        <RefreshCw size={15} /> Retry
      </button>
    )}
  </div>
);
