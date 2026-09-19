import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './common.css';

export const Pagination = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="pagination">
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="pagination-label">
        {page} <span className="text-muted">/ {totalPages}</span>
      </span>
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};
