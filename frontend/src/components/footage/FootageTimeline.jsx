import React from 'react';
import './footage.css';

export const FootageTimeline = ({ events = [] }) => {
  if (events.length === 0) return (
    <div className="footage-timeline-empty">No events detected in this clip.</div>
  );

  return (
    <div className="footage-timeline">
      <div className="ft-track">
        <div className="ft-baseline" />
        {events.map((evt, i) => (
          <div
            key={i}
            className="ft-marker"
            style={{ left: `${(i / (events.length - 1 || 1)) * 100}%` }}
            title={evt.label}
          >
            <div className={`ft-dot sev-${evt.severity}`} />
            <span className="ft-label">{evt.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
