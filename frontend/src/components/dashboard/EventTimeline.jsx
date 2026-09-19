import React from 'react';
import { MOCK_TIMELINE_EVENTS } from '../../data/mockData';
import './dashboard.css';

const SEV_COLOR = {
  critical: 'var(--critical-color)',
  warning: 'var(--warning-color)',
  info: 'var(--info-color)',
};

export const EventTimeline = () => {
  return (
    <div className="event-timeline">
      <div className="timeline-track">
        {MOCK_TIMELINE_EVENTS.map((evt, i) => (
          <div key={evt.id} className="timeline-event" title={`${evt.label} — ${evt.camera}`}>
            <div
              className="timeline-dot"
              style={{ background: SEV_COLOR[evt.severity] || 'var(--text-muted)' }}
            />
            <div className="timeline-label">
              <span className="timeline-time">{evt.time}</span>
              <span className="timeline-desc">{evt.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
