import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Badge } from '../common/Badge';
import { MOCK_ALERTS } from '../../data/mockData';
import { useNavigate } from 'react-router-dom';
import './dashboard.css';

export const PriorityEventPanel = () => {
  const navigate = useNavigate();
  const topAlert = MOCK_ALERTS.filter(a => a.severity === 'Critical' && a.status !== 'Resolved')[0];

  if (!topAlert) return (
    <div className="priority-event-panel empty">
      <AlertTriangle size={20} className="text-muted" />
      <span className="text-muted">No active critical events</span>
    </div>
  );

  return (
    <div className="priority-event-panel active">
      <div className="pep-alert-bar" />
      <div className="pep-content">
        <div className="pep-header">
          <AlertTriangle size={16} className="text-critical" />
          <span className="pep-label">Highest Priority Event</span>
          <Badge variant="critical" dot>{topAlert.severity}</Badge>
        </div>
        <p className="pep-event">{topAlert.event}</p>
        <div className="pep-meta">
          <span>{topAlert.camera}</span>
          <span>·</span>
          <span>{topAlert.location}</span>
          <span>·</span>
          <span className="font-mono">{topAlert.time}</span>
        </div>
      </div>
      <button
        className="btn btn-danger btn-sm"
        onClick={() => navigate('/alerts')}
      >
        View <ArrowRight size={13} />
      </button>
    </div>
  );
};
