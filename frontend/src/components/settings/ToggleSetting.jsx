import React, { useState } from 'react';
import './settings.css';

export const ToggleSetting = ({ label, description, defaultChecked = false, disabled = false }) => {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className={`setting-row ${disabled ? 'setting-disabled' : ''}`}>
      <div className="setting-info">
        <span className="setting-label">{label}</span>
        {description && <span className="setting-desc">{description}</span>}
        {disabled && <span className="setting-permission-badge">Permission Required</span>}
      </div>
      <div className="setting-control">
        <button
          role="switch"
          aria-checked={checked}
          className={`toggle-switch ${checked ? 'on' : ''}`}
          onClick={() => !disabled && setChecked(p => !p)}
          disabled={disabled}
          aria-label={label}
        >
          <span className="toggle-thumb" />
        </button>
      </div>
    </div>
  );
};
