import React from 'react';
import './settings.css';

export const SelectSetting = ({ label, description, options = [], defaultValue, disabled = false }) => (
  <div className={`setting-row ${disabled ? 'setting-disabled' : ''}`}>
    <div className="setting-info">
      <span className="setting-label">{label}</span>
      {description && <span className="setting-desc">{description}</span>}
      {disabled && <span className="setting-permission-badge">Permission Required</span>}
    </div>
    <div className="setting-control">
      <select className="filter-select" defaultValue={defaultValue} disabled={disabled} style={{ minWidth: 200 }}>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  </div>
);
