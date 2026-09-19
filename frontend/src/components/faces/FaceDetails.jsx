import React from 'react';
import { X, User, MapPin, Calendar, Hash, FileText, Search } from 'lucide-react';
import { Badge } from '../common/Badge';
import { OsintStatus } from './OsintStatus';
import './faces.css';

const STATUS_VARIANT = { Target: 'critical', Watchlist: 'warning', Employee: 'info', Cleared: 'success' };

export const FaceDetails = ({ person, isOpen, onClose }) => {
  if (!person) return null;

  return (
    <>
      <div className={`face-panel-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <div className={`face-details-panel ${isOpen ? 'open' : ''}`}>
        <div className="panel-header">
          <div>
            <h2 className="panel-title">{person.name}</h2>
            <span className="face-id">{person.id}</span>
          </div>
          <button className="icon-button" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="face-details-body">
          {/* Avatar */}
          <div className="fd-avatar-section">
            <div className="fd-avatar-large"><User size={56} /></div>
            <div style={{ textAlign: 'center' }}>
              <Badge variant={STATUS_VARIANT[person.status] || 'neutral'}>{person.status}</Badge>
              <p className="face-privacy-label" style={{ marginTop: 6 }}>
                {['Target','Watchlist'].includes(person.status) ? 'Potential Match' : 'Associated Face Record'}
              </p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="detail-section">
            <h4 className="detail-section-title">Record Details</h4>
            <div className="detail-grid">
              <span className="detail-label"><MapPin size={12} /> Last Seen</span>
              <span className="detail-value">{person.lastSeen}</span>
              <span className="detail-label"><Calendar size={12} /> Date</span>
              <span className="detail-value">{person.lastSeenDate}</span>
              <span className="detail-label"><Hash size={12} /> Events</span>
              <span className="detail-value">{person.events} detection event{person.events !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Description */}
          {person.description && (
            <div className="detail-section">
              <h4 className="detail-section-title">Notes</h4>
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{person.description}</p>
            </div>
          )}

          {/* Tags */}
          {person.tags?.length > 0 && (
            <div className="face-tags">
              {person.tags.map(t => <span key={t} className="tag">{t}</span>)}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
              <Search size={14} /> Search Footage
            </button>
            <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
              <FileText size={14} /> Generate Report
            </button>
          </div>

          {/* OSINT */}
          <OsintStatus personId={person.id} />
        </div>
      </div>
    </>
  );
};
