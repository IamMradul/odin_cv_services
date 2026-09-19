import React from 'react';
import './dashboard.css';

// DetectionOverlay renders SVG bounding boxes over a camera feed
// Boxes are specified as percentage coordinates (0-100)
export const DetectionOverlay = ({ detections = [] }) => {
  if (!detections.length) return null;

  const typeColor = {
    person: '#3B82F6',
    vehicle: '#F59E0B',
    face: '#10B981',
    anpr: '#8B5CF6',
  };

  return (
    <svg
      className="detection-overlay-svg"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {detections.map((d, i) => {
        const color = typeColor[d.type] || '#94A3B8';
        return (
          <g key={i}>
            <rect
              x={d.bbox.x}
              y={d.bbox.y}
              width={d.bbox.w}
              height={d.bbox.h}
              fill="none"
              stroke={color}
              strokeWidth="0.6"
              strokeDasharray={d.type === 'face' ? '2 1' : 'none'}
            />
            <rect
              x={d.bbox.x}
              y={d.bbox.y - 4.5}
              width={d.bbox.w}
              height={4.5}
              fill={color}
              opacity={0.85}
            />
            <text
              x={d.bbox.x + 0.6}
              y={d.bbox.y - 0.8}
              fontSize="3"
              fill="#fff"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {d.label} {d.confidence}%
            </text>
          </g>
        );
      })}
    </svg>
  );
};
