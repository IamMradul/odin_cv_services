import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../common/Badge';
import { ArrowRight } from 'lucide-react';
import { useAlerts } from '../../hooks/useAlerts';
import './dashboard.css';

export const RecentAlerts = () => {
  const navigate = useNavigate();
  const { alerts, isLoading } = useAlerts({ limit: 5 });

  const severityVariant = (s) => {
    const sev = s?.toLowerCase();
    if (sev === 'critical') return 'critical';
    if (sev === 'warning') return 'warning';
    return 'info';
  };

  if (isLoading) return <div className="p-4">Loading alerts...</div>;

  return (
    <div className="recent-alerts-panel">
      <div className="ra-list">
        {alerts.length === 0 ? <div className="p-4 text-muted">No recent alerts</div> : alerts.map(alert => (
          <button
            key={alert.id}
            className="ra-item"
            onClick={() => navigate('/alerts')}
          >
            <div className="ra-severity-bar" data-sev={alert.severity?.toLowerCase()} />
            <div className="ra-body">
              <div className="ra-header">
                <span className="ra-event">{alert.alert_type}</span>
                <Badge variant={severityVariant(alert.severity)}>{alert.severity}</Badge>
              </div>
              <div className="ra-meta">
                <span>{alert.source_id}</span>
                <span>·</span>
                <span className="font-mono">{new Date(alert.created_at).toLocaleTimeString()}</span>
                <span>·</span>
                <span className={`ra-status status-${alert.status?.toLowerCase().replace(' ', '-')}`}>{alert.status}</span>
              </div>
            </div>
            <ArrowRight size={14} className="text-muted ra-arrow" />
          </button>
        ))}
      </div>
    </div>
  );
};
