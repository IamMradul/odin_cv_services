import React from 'react';
import './footage.css';

export const FootageFilters = ({ filters = {}, onFilterChange }) => {
  const update = (key, val) => onFilterChange?.({ ...filters, [key]: val });

  return (
    <div className="alert-filters-bar" style={{ marginBottom: 'var(--space-5)' }}>
      <div className="filter-group">
        <span className="filter-group-label">Camera:</span>
        <select className="filter-select" value={filters.camera || 'all'} onChange={e => update('camera', e.target.value)}>
          <option value="all">All Cameras</option>
          <option value="CAM-01">Main Entrance</option>
          <option value="CAM-02">Lobby</option>
          <option value="CAM-03">Loading Dock</option>
          <option value="CAM-04">Parking Level 1</option>
        </select>
      </div>
      <div className="filter-group">
        <span className="filter-group-label">Date:</span>
        <input
          type="date"
          className="filter-select"
          value={filters.date || ''}
          onChange={e => update('date', e.target.value)}
          style={{ paddingRight: 'var(--space-3)' }}
        />
      </div>
    </div>
  );
};
