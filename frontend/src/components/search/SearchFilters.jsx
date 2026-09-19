import React from 'react';
import { Filter, Video, AlertTriangle, Calendar } from 'lucide-react';
import './search.css';

export const SearchFilters = () => {
  return (
    <aside className="search-filters-sidebar">
      <div className="filter-section">
        <h3 className="filter-title">
          <Calendar size={16} /> Time Range
        </h3>
        <div className="filter-list">
          <label className="filter-label">
            <input type="radio" name="time" className="filter-checkbox" defaultChecked /> Any Time
          </label>
          <label className="filter-label">
            <input type="radio" name="time" className="filter-checkbox" /> Last 24 Hours
          </label>
          <label className="filter-label">
            <input type="radio" name="time" className="filter-checkbox" /> Past Week
          </label>
          <label className="filter-label">
            <input type="radio" name="time" className="filter-checkbox" /> Custom Range
          </label>
        </div>
      </div>

      <div className="filter-section">
        <h3 className="filter-title">
          <Video size={16} /> Camera Locations
        </h3>
        <div className="filter-list">
          <label className="filter-label">
            <input type="checkbox" className="filter-checkbox" defaultChecked /> Main Entrance (CAM-01)
          </label>
          <label className="filter-label">
            <input type="checkbox" className="filter-checkbox" defaultChecked /> Lobby (CAM-02)
          </label>
          <label className="filter-label">
            <input type="checkbox" className="filter-checkbox" /> Loading Dock (CAM-03)
          </label>
          <label className="filter-label">
            <input type="checkbox" className="filter-checkbox" /> Parking (CAM-04)
          </label>
        </div>
      </div>

      <div className="filter-section">
        <h3 className="filter-title">
          <AlertTriangle size={16} /> Event Type
        </h3>
        <div className="filter-list">
          <label className="filter-label">
            <input type="checkbox" className="filter-checkbox" /> Intrusion
          </label>
          <label className="filter-label">
            <input type="checkbox" className="filter-checkbox" /> Person Detected
          </label>
          <label className="filter-label">
            <input type="checkbox" className="filter-checkbox" /> Vehicle Detected
          </label>
        </div>
      </div>
    </aside>
  );
};
