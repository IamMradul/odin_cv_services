import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { alertService } from '../services/alertService';
import { AlertStatusBadge } from '../components/alerts/AlertStatusBadge';
import { AlertActions } from '../components/alerts/AlertActions';
import { Badge } from '../components/common/Badge';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { ArrowLeft, Clock, MessageSquare, Send } from 'lucide-react';
import '../components/alerts/alerts.css';

const SEV_VARIANT = { Critical: 'critical', Warning: 'warning', Info: 'info' };

const AlertDetail = () => {
  const { alertId } = useParams();
  const navigate = useNavigate();
  const [alert, setAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    alertService.getById(alertId).then(data => {
      if (data) setAlert(data);
      else setError('Alert not found.');
      setIsLoading(false);
    }).catch(err => {
      setError(err.message);
      setIsLoading(false);
    });
  }, [alertId]);

  const handleAction = async (action, a) => {
    const STATUS_MAP = { acknowledge: 'Acknowledged', investigate: 'Investigating', resolve: 'Resolved' };
    if (STATUS_MAP[action]) {
      const updated = await alertService.updateStatus(a.id, STATUS_MAP[action]);
      setAlert(updated);
    } else if (action === 'note' && note.trim()) {
      const updated = await alertService.addNote(a.id, note);
      setAlert(updated);
      setNote('');
    }
  };

  if (isLoading) return <LoadingState rows={4} />;
  if (error || !alert) return <ErrorState message={error || 'Alert not found.'} onRetry={() => navigate('/alerts')} />;

  return (
    <div className="alerts-page">
      <div className="page-header">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/alerts')} style={{ marginBottom: 'var(--space-2)' }}>
            <ArrowLeft size={14} /> Back to Alerts
          </button>
          <h1 className="page-title">{alert.id}</h1>
          <p className="page-subtitle">{alert.event}</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <AlertStatusBadge status={alert.status} />
          <Badge variant={SEV_VARIANT[alert.severity] || 'neutral'}>{alert.severity}</Badge>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 'var(--space-6)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* Snapshot */}
          <div className="snapshot-container" style={{ borderRadius: 'var(--radius-card)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <video src="/footage.mp4" style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay loop muted playsInline />
            <div className="snapshot-overlay-label">
              <span>{alert.camera}</span>
              <span className="font-mono">{alert.time}</span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="detail-section">
            <h4 className="detail-section-title">Event Details</h4>
            <div className="detail-grid">
              <span className="detail-label">Camera</span><span className="detail-value">{alert.camera}</span>
              <span className="detail-label">Location</span><span className="detail-value">{alert.location}</span>
              <span className="detail-label">Entity</span><span className="detail-value font-mono">{alert.entity || '—'}</span>
              <span className="detail-label">Date</span><span className="detail-value">{alert.date}</span>
              <span className="detail-label">Assigned</span><span className="detail-value">{alert.assigned || 'Unassigned'}</span>
            </div>
          </div>

          {/* Notes */}
          {alert.notes?.length > 0 && (
            <div className="detail-section">
              <h4 className="detail-section-title"><MessageSquare size={14} /> Operator Notes</h4>
              {alert.notes.map((n, i) => (
                <div key={i} className="note-item"><span>{n}</span></div>
              ))}
            </div>
          )}

          {alert.status === 'Investigating' && (
            <div className="detail-section">
              <h4 className="detail-section-title">Add Note</h4>
              <div className="note-input-row">
                <textarea className="note-textarea" rows={3} placeholder="Enter notes…" value={note} onChange={e => setNote(e.target.value)} />
                <button className="btn btn-primary btn-sm" onClick={() => handleAction('note', alert)} disabled={!note.trim()}>
                  <Send size={13} /> Add
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right column: Actions + Audit Trail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div className="detail-section">
            <h4 className="detail-section-title">Actions</h4>
            <AlertActions alert={alert} onAction={handleAction} />
          </div>

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
    </div>
  );
};

export default AlertDetail;
