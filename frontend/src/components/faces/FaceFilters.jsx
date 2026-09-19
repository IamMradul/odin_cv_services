import React from 'react';
import { Search } from 'lucide-react';
import './faces.css';

export const FaceFilters = ({ filters = {}, onFilterChange }) => {
  const update = (key, val) => onFilterChange?.({ ...filters, [key]: val });

  return (
    <div className="face-filters-bar">
      <div className="search-bar-wrapper" style={{ flex: 1, maxWidth: 300 }}>
        <Search size={16} className="search-bar-icon" />
        <input
          type="text"
          className="search-bar-input"
          placeholder="Search by name or ID…"
          value={filters.query || ''}
          onChange={e => update('query', e.target.value)}
          style={{ fontSize: 'var(--font-sm)' }}
        />
      </div>

      <select className="filter-select" value={filters.status || 'all'} onChange={e => update('status', e.target.value)}>
        <option value="all">All Statuses</option>
        <option value="target">Target</option>
        <option value="watchlist">Watchlist</option>
        <option value="employee">Employee</option>
        <option value="cleared">Cleared</option>
      </select>
    </div>
  );
};
