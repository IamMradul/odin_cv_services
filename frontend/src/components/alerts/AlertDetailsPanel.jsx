import React, { useState } from 'react';
import { X, FileText, Clock, User, MessageSquare, Send } from 'lucide-react';
import { Badge } from '../common/Badge';
import { AlertStatusBadge } from './AlertStatusBadge';
import { AlertActions } from './AlertActions';
import './alerts.css';

const SEV_VARIANT = { Critical: 'critical', Warning: 'warning', Info: 'info' };

export const AlertDetailsPanel = ({ alert, isOpen, onClose, onAction }) => {
  const [note, setNote] = useState('');

  if (!alert) return null;

  const handleAddNote = () => {
    if (note.trim()) {
      onAction?.('note', alert, note);
      setNote('');
    }
  };

  return (
    <>
      <div
        className={`alert-details-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      <div className={`alert-details-panel ${isOpen ? 'open' : ''}`}>
        <div className="panel-header">
          <div>
            <h2 className="panel-title">{alert.id}</h2>
            <p className="panel-subtitle">{alert.event}</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="panel-body">
          {/* Status & Severity */}
          <div className="detail-row">
            <AlertStatusBadge status={alert.status} />
            <Badge variant={SEV_VARIANT[alert.severity] || 'neutral'}>{alert.severity}</Badge>
          </div>

          {/* Frame Snapshot */}
          <div className="snapshot-container">
            <video
              src="/footage.mp4"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              autoPlay loop muted playsInline
            />
            <div className="snapshot-overlay-label">
              <span>{alert.camera}</span>
              <span className="font-mono">{alert.time}</span>
            </div>
          </div>

          {/* Details */}
          <div className="detail-section">
            <h4 className="detail-section-title">Event Details</h4>
            <div className="detail-grid">
              <span className="detail-label">Alert ID</span>
              <span className="detail-value font-mono">{alert.id}</span>
              <span className="detail-label">Camera</span>
              <span className="detail-value">{alert.camera}</span>
              <span className="detail-label">Location</span>
              <span className="detail-value">{alert.location}</span>
              <span className="detail-label">Entity</span>
              <span className="detail-value font-mono">{alert.entity || '—'}</span>
              <span className="detail-label">Assigned</span>
              <span className="detail-value">{alert.assigned || 'Unassigned'}</span>
            </div>
          </div>

          {/* Lifecycle Actions */}
          <div className="detail-section">
            <h4 className="detail-section-title">Actions</h4>
            <AlertActions alert={alert} onAction={(action, a) => onAction?.(action, a)} />
          </div>

          {/* Notes */}
          {alert.notes?.length > 0 && (
            <div className="detail-section">
              <h4 className="detail-section-title"><MessageSquare size={14} /> Operator Notes</h4>
              {alert.notes.map((n, i) => (
                <div key={i} className="note-item">
                  <User size={13} className="text-muted" />
                  <span>{n}</span>
                </div>
              ))}
            </div>
          )}

          {/* Add Note (only when Investigating) */}
          {alert.status === 'Investigating' && (
            <div className="detail-section">
              <h4 className="detail-section-title">Add Note</h4>
              <div className="note-input-row">
                <textarea
                  className="note-textarea"
                  placeholder="Enter investigation notes…"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  rows={3}
                />
                <button className="btn btn-primary btn-sm" onClick={handleAddNote} disabled={!note.trim()}>
                  <Send size={13} /> Add
                </button>
              </div>
            </div>
          )}

          {/* Audit Trail */}
          <div className="detail-section">
            <h4 className="detail-section-title"><Clock size={14} /> Audit Trail</h4>
            <div className="audit-list">
              {alert.auditTrail?.map((entry, i) => (
                <div key={i} className="audit-item">
                  <div className="audit-dot" />
                  <div className="audit-content">
                    <span className="audit-action">{entry.action}</span>
                    <span className="audit-meta">{entry.operator} · <span className="font-mono">{entry.time}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
