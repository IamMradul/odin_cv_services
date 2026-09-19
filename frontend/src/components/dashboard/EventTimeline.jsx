import React from 'react';
import { useAlerts } from '../../hooks/useAlerts';
import './dashboard.css';

export const EventTimeline = () => {
  const { alerts, isLoading } = useAlerts({ limit: 10 });

  const getEventColor = (type) => {
    if (!type) return 'var(--text-muted)';
    const t = type.toLowerCase();
    if (t.includes('safe')) return 'var(--success-color)';
    if (t.includes('unidentified') || t.includes('unrecognized')) return '#c084fc';
    if (t.includes('threat') || t.includes('armed') || t.includes('suspicious') || t.includes('critical')) return 'var(--critical-color)';
    return 'var(--warning-color)';
  };

  if (isLoading) return <div className="p-4">Loading timeline...</div>;

  return (
    <div className="event-timeline">
      <div className="timeline-track">
        {alerts.map((evt) => (
          <div key={evt.id} className="timeline-event" title={`${evt.alert_type} — ${evt.source_id}`}>
            <div
              className="timeline-dot"
              style={{ background: getEventColor(evt.alert_type) }}
            />
            <div className="timeline-label">
              <span className="timeline-time">{new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span className="timeline-desc">{evt.alert_type}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
