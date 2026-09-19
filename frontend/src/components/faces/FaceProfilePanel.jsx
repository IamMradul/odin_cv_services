import React from 'react';
import { X, User } from 'lucide-react';
import { Badge } from '../common/Badge';
import { OsintStatus } from './OsintStatus';
import './faces.css';

export const FaceProfilePanel = ({ person, isOpen, onClose }) => {
  if (!person) return null;

  return (
    <div className={`alert-details-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} style={{ zIndex: 50 }}>
      <div className="alert-details-panel" onClick={(e) => e.stopPropagation()}>
        <div className="panel-header">
          <h2 className="panel-title">Entity Profile</h2>
          <button className="panel-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="panel-content">
          <div className="face-profile-header">
            <div className="profile-avatar">
              <User size={48} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}>{person.name}</h2>
              <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{person.id}</span>
              <Badge variant={
                person.status === 'Target' ? 'critical' : 
                person.status === 'Watchlist' ? 'warning' : 
                person.status === 'Cleared' ? 'success' : 'info'
              } style={{ marginTop: '4px' }}>
                {person.status}
              </Badge>
            </div>

            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-value">12</span>
                <span className="stat-label">Sightings</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">4</span>
                <span className="stat-label">Locations</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">3</span>
                <span className="stat-label">Alerts</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <span className="detail-label">Known Aliases / Tags</span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {person.tags.map(tag => (
                <span key={tag} style={{ 
                  padding: '2px 8px', 
                  backgroundColor: '#F5F5F5', 
                  borderRadius: '4px', 
                  fontSize: '12px',
                  color: 'var(--text-secondary)'
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="detail-section">
            <span className="detail-label">Intelligence</span>
            <OsintStatus personId={person.id} />
          </div>

        </div>

        <div className="panel-footer">
          <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
            Find Associated Footage
          </button>
        </div>
      </div>
    </div>
  );
};
