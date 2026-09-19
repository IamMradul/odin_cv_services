import React from 'react';
import './dashboard.css';

export const MetricCard = ({ title, value, icon: Icon, trend, trendLabel, color = 'info', subtitle }) => {
  const colorMap = {
    success:  { text: 'var(--success-color)',  bg: 'var(--success-light)'  },
    critical: { text: 'var(--critical-color)', bg: 'var(--critical-light)' },
    warning:  { text: 'var(--warning-color)',  bg: 'var(--warning-light)'  },
    info:     { text: 'var(--info-color)',      bg: 'var(--info-light)'     },
  };
  const { text, bg } = colorMap[color] || colorMap.info;

  return (
    <div className="metric-card">
      <div className="metric-header">
        <h3 className="metric-title">{title}</h3>
        <div className="metric-icon-wrapper" style={{ background: bg, color: text }}>
          <Icon size={18} />
        </div>
      </div>
      <div className="metric-value" style={{ color: text }}>{value}</div>
      {subtitle && <p className="metric-subtitle">{subtitle}</p>}
      {trend !== undefined && trend !== null && (
        <div className="metric-trend">
          <span style={{ color: trend > 0 ? 'var(--critical-color)' : 'var(--success-color)', fontWeight: 600, fontSize: 'var(--font-xs)' }}>
            {trend > 0 ? `+${trend}` : trend}
          </span>
          {trendLabel && <span className="text-muted" style={{ fontSize: 'var(--font-xs)' }}> {trendLabel}</span>}
        </div>
      )}
    </div>
  );
};
