import React, { useState, useEffect } from 'react';
import { X, User, MapPin, Calendar, Hash, FileText, Search, Cpu } from 'lucide-react';
import { Badge } from '../common/Badge';
import { OsintStatus } from './OsintStatus';
import './faces.css';

const STATUS_VARIANT = { Target: 'critical', Watchlist: 'warning', Employee: 'info', Cleared: 'success' };

export const FaceDetails = ({ person, isOpen, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (isOpen && person) {
      setIsScanning(true);
      const timer = setTimeout(() => setIsScanning(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, person]);

  if (!person) return null;

  return (
    <>
      <div className={`face-panel-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <div className={`face-details-panel ${isOpen ? 'open' : ''}`}>
        {isScanning && (
          <div className="cyber-scan-overlay">
            <div className="scan-line"></div>
            <Cpu size={48} className="decode-icon" />
            <div className="decode-text">Initiating Deep OSINT...</div>
            <div className="scan-progress">
              <div className="scan-progress-bar"></div>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Cross-referencing global databases...</div>
          </div>
        )}

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
            <div className="fd-avatar-large" style={{ overflow: 'hidden' }}>
              {person.imageUrl ? (
                <img src={person.imageUrl} alt={person.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={56} />
              )}
            </div>
            <div style={{ textAlign: 'center' }}>
              <Badge variant={STATUS_VARIANT[person.status] || 'neutral'}>{person.status}</Badge>
              <p className="face-privacy-label" style={{ marginTop: 6, position: 'relative', background: 'transparent', color: 'var(--text-secondary)' }}>
                {['Target','Watchlist'].includes(person.status) ? 'Potential Match' : 'Associated Face Record'}
              </p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="detail-section">
            <h4 className="detail-section-title">Record Details</h4>
            <div className="detail-grid">
              <span className="detail-label"><User size={12} /> Name</span>
              <span className="detail-value">{person.name}</span>
              <span className="detail-label"><Hash size={12} /> Contact</span>
              <span className="detail-value">{person.osintData ? person.osintData.contact : (person.contact || 'N/A')}</span>
              {person.osintData && (
                <>
                  <span className="detail-label"><MapPin size={12} /> Address</span>
                  <span className="detail-value" style={{ gridColumn: '2 / -1' }}>{person.osintData.address}</span>
                  <span className="detail-label"><Hash size={12} /> Uni ID</span>
                  <span className="detail-value">{person.osintData.universityId}</span>
                </>
              )}
              <span className="detail-label"><MapPin size={12} /> Last Seen</span>
              <span className="detail-value">{person.lastSeen}</span>
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
          <OsintStatus person={person} />
        </div>
      </div>
    </>
  );
};
