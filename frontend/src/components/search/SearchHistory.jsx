import React from 'react';
import { Clock, X, Trash2 } from 'lucide-react';
import './search.css';

export const SearchHistory = ({ history, onSelect, onClear }) => {
  if (!history || history.length === 0) return null;

  return (
    <div className="search-history">
      <div className="sh-header">
        <span className="sh-title"><Clock size={13} /> Recent Searches</span>
        <button className="btn btn-ghost btn-sm" onClick={onClear}>
          <Trash2 size={13} /> Clear
        </button>
      </div>
      <div className="sh-list">
        {history.map((item, i) => (
          <button
            key={i}
            className="sh-item"
            onClick={() => onSelect(item.query)}
          >
            <Clock size={13} className="text-muted" />
            <span>{item.query}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
