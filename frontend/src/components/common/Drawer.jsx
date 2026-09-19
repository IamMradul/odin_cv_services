import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import './common.css';

export const Drawer = ({ isOpen, onClose, title, children, width = 480 }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  return (
    <>
      <div
        className={`drawer-overlay ${isOpen ? 'drawer-overlay-open' : ''}`}
        onClick={onClose}
      />
      <div
        className={`drawer-panel ${isOpen ? 'drawer-panel-open' : ''}`}
        style={{ width }}
        role="dialog"
        aria-modal="true"
      >
        <div className="drawer-header">
          <h3 className="drawer-title">{title}</h3>
          <button className="icon-button" onClick={onClose} aria-label="Close panel">
            <X size={18} />
          </button>
        </div>
        <div className="drawer-body">{children}</div>
      </div>
    </>
  );
};
