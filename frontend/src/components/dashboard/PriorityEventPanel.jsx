import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Badge } from '../common/Badge';
import { useAlerts } from '../../hooks/useAlerts';
import { useNavigate } from 'react-router-dom';
import './dashboard.css';

export const PriorityEventPanel = () => {
  const navigate = useNavigate();
  const { alerts, isLoading } = useAlerts({ severity: 'critical' });
  const topAlert = alerts.filter(a => a.status !== 'Resolved')[0];

  if (isLoading) return <div className="p-4">Loading alerts...</div>;

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
          <Badge variant="critical" dot>{topAlert.severity || 'Critical'}</Badge>
        </div>
        <p className="pep-event">{topAlert.alert_type}</p>
        <div className="pep-meta">
          <span>{topAlert.source_id}</span>
          <span>·</span>
          <span className="font-mono">{new Date(topAlert.timestamp).toLocaleTimeString()}</span>
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
