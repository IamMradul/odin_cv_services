import React from 'react';
import { Badge } from '../common/Badge';
import { User, MapPin, Eye, Search as SearchIcon, FileText } from 'lucide-react';
import './faces.css';

const STATUS_VARIANT = {
  Target:    'critical',
  Watchlist: 'warning',
  Employee:  'info',
  Cleared:   'success',
};

// Privacy: Use "Potential Match" for Watchlist/Target, "Associated Face Record" for Employee/Cleared
const PRIVACY_LABEL = {
  Target:    'Potential Match',
  Watchlist: 'Potential Match',
  Employee:  'Associated Face Record',
  Cleared:   'Associated Face Record',
};

export const FaceCard = ({ person, onView, onOsint }) => {
  return (
    <div className="face-card">
      <div className="face-avatar-container">
        <div className="face-avatar">
          <User size={36} />
        </div>
        <div className="face-privacy-label">
          {PRIVACY_LABEL[person.status] || 'Detection Event'}
        </div>
      </div>

      <div className="face-info">
        <div className="face-header">
          <h3 className="face-name">{person.name}</h3>
          <Badge variant={STATUS_VARIANT[person.status] || 'neutral'}>
            {person.status}
          </Badge>
        </div>
        <span className="face-id">{person.id}</span>
      </div>

      <div className="face-meta">
        <MapPin size={13} />
        <span>Last seen: {person.lastSeen}</span>
      </div>

      <div className="face-tags">
        {person.tags?.map(tag => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>

      <div className="face-actions">
        <button className="btn btn-secondary btn-sm" onClick={() => onView(person)}>
          <Eye size={13} /> View Profile
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => onOsint(person)}>
          <SearchIcon size={13} /> Search Deeper
        </button>
      </div>
    </div>
  );
};
