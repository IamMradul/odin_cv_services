import React, { useState } from 'react';
import { MapPin, Radio } from 'lucide-react';
import './dashboard.css';

const CAMERA_PINS = [
  { id: 'CAM-01', label: 'Main Entrance', x: 20, y: 30, status: 'normal' },
  { id: 'CAM-02', label: 'Lobby', x: 50, y: 45, status: 'normal' },
  { id: 'CAM-03', label: 'Loading Dock', x: 75, y: 70, status: 'warning' },
  { id: 'CAM-04', label: 'Parking B1', x: 40, y: 78, status: 'offline' },
];

const STATUS_COLOR = {
  normal: 'var(--success-color)',
  warning: 'var(--warning-color)',
  priority: 'var(--critical-color)',
  offline: 'var(--text-muted)',
};

export const MapPanel = () => {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="map-panel">
      <div className="map-header">
        <Radio size={14} className="text-success" />
        <span>Live Map — Building Floor Plan</span>
      </div>
      <div className="map-canvas">
        {/* Floor plan outline */}
        <svg viewBox="0 0 100 100" className="map-svg">
          {/* Building outline */}
          <rect x="5" y="5" width="90" height="90" fill="none" stroke="var(--border-color)" strokeWidth="0.6" rx="2" />
          {/* Rooms */}
          <rect x="5" y="5" width="40" height="35" fill="rgba(59,130,246,0.03)" stroke="var(--border-subtle)" strokeWidth="0.4" />
          <text x="15" y="24" fontSize="4" fill="var(--text-muted)" fontFamily="monospace">Entrance</text>
          <rect x="45" y="5" width="50" height="35" fill="rgba(59,130,246,0.03)" stroke="var(--border-subtle)" strokeWidth="0.4" />
          <text x="55" y="24" fontSize="4" fill="var(--text-muted)" fontFamily="monospace">Lobby</text>
          <rect x="5" y="40" width="40" height="55" fill="rgba(59,130,246,0.03)" stroke="var(--border-subtle)" strokeWidth="0.4" />
          <text x="12" y="70" fontSize="4" fill="var(--text-muted)" fontFamily="monospace">Parking</text>
          <rect x="45" y="40" width="50" height="55" fill="rgba(59,130,246,0.03)" stroke="var(--border-subtle)" strokeWidth="0.4" />
          <text x="55" y="70" fontSize="4" fill="var(--text-muted)" fontFamily="monospace">Loading Dock</text>

          {/* Camera pins */}
          {CAMERA_PINS.map(pin => (
            <g
              key={pin.id}
              transform={`translate(${pin.x}, ${pin.y})`}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHovered(pin)}
              onMouseLeave={() => setHovered(null)}
            >
              {pin.status !== 'offline' && (
                <circle r="4" fill={STATUS_COLOR[pin.status]} opacity="0.2">
                  <animate attributeName="r" from="4" to="8" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.2" to="0" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <circle r="3.5" fill={STATUS_COLOR[pin.status]} />
              <circle r="1.5" fill="#fff" />
            </g>
          ))}

          {/* Tooltip */}
          {hovered && (
            <g transform={`translate(${hovered.x}, ${hovered.y - 12})`}>
              <rect x="-18" y="-7" width="36" height="8" rx="1.5" fill="var(--surface-elevated)" stroke="var(--border-color)" strokeWidth="0.4" />
              <text textAnchor="middle" y="-1.5" fontSize="3.5" fill="var(--text-primary)" fontFamily="monospace">
                {hovered.label}
              </text>
            </g>
          )}
        </svg>
      </div>
      <div className="map-legend">
        <div className="legend-item"><span className="legend-dot" style={{ background: 'var(--success-color)' }} />Online</div>
        <div className="legend-item"><span className="legend-dot" style={{ background: 'var(--warning-color)' }} />Warning</div>
        <div className="legend-item"><span className="legend-dot" style={{ background: 'var(--critical-color)' }} />Critical</div>
        <div className="legend-item"><span className="legend-dot" style={{ background: 'var(--text-muted)' }} />Offline</div>
      </div>
    </div>
  );
};
