import React, { useState, useEffect } from 'react';
import { Globe, Loader, CheckCircle, XCircle, Search, Clock } from 'lucide-react';
import { faceService } from '../../services/faceService';
import './faces.css';

const STATE_LABELS = {
  idle:       null,
  queued:     'Queued — awaiting pipeline slot',
  processing: 'Processing — cross-referencing databases',
  collecting: 'Collecting — gathering results',
  ready:      'Results Ready',
  failed:     'Search Failed',
};

export const OsintStatus = ({ personId }) => {
  const [state, setState] = useState('idle');

  const triggerSearch = async () => {
    await faceService.triggerOsint(personId);
    setState('queued');
  };

  // Poll state from service
  useEffect(() => {
    if (state === 'idle' || state === 'ready' || state === 'failed') return;
    const interval = setInterval(() => {
      const s = faceService.getOsintState(personId);
      setState(s);
    }, 500);
    return () => clearInterval(interval);
  }, [state, personId]);

  useEffect(() => {
    setState('idle');
  }, [personId]);

  const inProgress = ['queued', 'processing', 'collecting'].includes(state);
  const progress = state === 'queued' ? 20 : state === 'processing' ? 55 : state === 'collecting' ? 80 : 0;

  return (
    <div className="osint-container">
      <div className="osint-header">
        <h4 className="osint-title">
          <Globe size={16} className="text-info" />
          OSINT Pipeline
        </h4>
        {inProgress && <span className="osint-state-badge processing"><Loader size={12} className="spinner" /> {STATE_LABELS[state]}</span>}
        {state === 'ready' && <span className="osint-state-badge ready"><CheckCircle size={12} /> Results Ready</span>}
        {state === 'failed' && <span className="osint-state-badge failed"><XCircle size={12} /> Failed</span>}
      </div>

      {state === 'idle' && (
        <div>
          <p className="osint-description">
            Run a deep cross-reference search across public records, social media, and connected databases.
          </p>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={triggerSearch}>
            <Search size={16} /> Search Deeper (OSINT)
          </button>
        </div>
      )}

      {inProgress && (
        <div className="osint-progress-wrap">
          <div className="osint-progress-bar">
            <div className="osint-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="osint-pct">{progress}%</span>
          <p className="osint-description">{STATE_LABELS[state]}</p>
        </div>
      )}

      {state === 'ready' && (
        <div className="osint-results">
          <div className="osint-result-item">
            <span>Social Media Match</span>
            <span className="text-success">3 Found</span>
          </div>
          <div className="osint-result-item">
            <span>Known Aliases</span>
            <span>2 Found</span>
          </div>
          <div className="osint-result-item">
            <span>Risk Score</span>
            <span className="text-critical">High (84/100)</span>
          </div>
          <div className="osint-result-item">
            <span>Public Records</span>
            <span>5 Matches</span>
          </div>
          <button className="btn btn-secondary" style={{ width: '100%', marginTop: 'var(--space-3)', justifyContent: 'center' }}>
            <Globe size={14} /> View Full OSINT Report
          </button>
        </div>
      )}

      {state === 'failed' && (
        <div>
          <p className="osint-description text-critical">The OSINT pipeline failed to return results. This may be due to a timeout or connection error.</p>
          <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setState('idle')}>
            Retry
          </button>
        </div>
      )}
    </div>
  );
};
