import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import './common.css';

export const OfflineState = ({ lastSeen, onRetry }) => (
  <div className="offline-state">
    <WifiOff size={28} className="text-muted" />
    <div className="offline-text">
      <span className="offline-label">Camera Offline</span>
      {lastSeen && <span className="offline-last-seen">Last seen {lastSeen}</span>}
    </div>
    {onRetry && (
      <button className="btn btn-ghost btn-sm" onClick={onRetry}>
        <RefreshCw size={13} /> Retry
      </button>
    )}
  </div>
);
