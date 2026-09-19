import React from 'react';
import './alerts.css';

export const AlertFilters = ({ filters = {}, onFilterChange }) => {
  const update = (key, value) => onFilterChange?.({ ...filters, [key]: value });

  return (
    <div className="alert-filters-bar">
      <div className="filter-group">
        <span className="filter-group-label">Severity:</span>
        <select
          className="filter-select"
          value={filters.severity || 'all'}
          onChange={e => update('severity', e.target.value)}
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
        </select>
      </div>

      <div className="filter-group">
        <span className="filter-group-label">Status:</span>
        <select
          className="filter-select"
          value={filters.status || 'all'}
          onChange={e => update('status', e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="investigating">Investigating</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div className="filter-group">
        <span className="filter-group-label">Time:</span>
        <select className="filter-select">
          <option>Last 24 Hours</option>
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
        </select>
      </div>
    </div>
  );
};
