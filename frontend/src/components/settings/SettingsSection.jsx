import React from 'react';
import './settings.css';

export const SettingsSection = ({ title, children }) => (
  <div className="settings-group">
    <h2 className="settings-section-title">{title}</h2>
    {children}
  </div>
);
