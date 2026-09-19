import React from 'react';
import './settings.css';

export const SettingInput = ({ label, description, type = 'text', placeholder, defaultValue }) => (
  <div className="setting-row">
    <div className="setting-info">
      <span className="setting-label">{label}</span>
      {description && <span className="setting-desc">{description}</span>}
    </div>
    <div className="setting-control">
      <input
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        style={{ maxWidth: 240 }}
      />
    </div>
  </div>
);
