import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../common/Badge';
import { ArrowRight } from 'lucide-react';
import { useAlerts } from '../../hooks/useAlerts';
import './dashboard.css';

export const RecentAlerts = () => {
  const navigate = useNavigate();
  const { alerts, isLoading } = useAlerts({ limit: 5 });

  const getEventColorAndVariant = (type) => {
    if (!type) return { color: 'var(--text-muted)', variant: 'info' };
    const t = type.toLowerCase();
    if (t.includes('safe')) return { color: 'var(--success-color)', variant: 'success' };
    if (t.includes('unidentified') || t.includes('unrecognized')) return { color: '#c084fc', variant: 'purple' };
    if (t.includes('threat') || t.includes('armed') || t.includes('suspicious')) return { color: 'var(--critical-color)', variant: 'critical' };
    return { color: 'var(--warning-color)', variant: 'warning' };
  };

  if (isLoading) return <div className="p-4">Loading alerts...</div>;

  return (
    <div className="recent-alerts-panel">
      <div className="ra-list">
        {alerts.length === 0 ? <div className="p-4 text-muted">No recent alerts</div> : alerts.map(alert => {
          const { color, variant } = getEventColorAndVariant(alert.alert_type);
          return (
          <button
            key={alert.id}
            className="ra-item"
            onClick={() => navigate('/alerts')}
          >
            <div className="ra-severity-bar" style={{ background: color }} />
            <div className="ra-body">
              <div className="ra-header">
                <span className="ra-event">{alert.alert_type}</span>
                <Badge variant={variant}>{alert.severity}</Badge>
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
          );
        })}
      </div>
    </div>
  );
};
