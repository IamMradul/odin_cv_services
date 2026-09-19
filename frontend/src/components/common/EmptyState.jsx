import React from 'react';
import './common.css';

export const EmptyState = ({ icon: Icon, title, description, action, actionLabel, actionVariant = 'primary' }) => (
  <div className="empty-state">
    {Icon && (
      <div className="empty-state-icon">
        <Icon size={36} />
      </div>
    )}
    <h3 className="empty-state-title">{title}</h3>
    {description && <p className="empty-state-desc">{description}</p>}
    {action && (
      <button className={`btn btn-${actionVariant}`} onClick={action}>
        {actionLabel}
      </button>
    )}
  </div>
);
