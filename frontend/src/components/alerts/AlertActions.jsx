import React from 'react';
import {
  Eye, CheckCircle, UserPlus, Search, StickyNote,
  CheckSquare, FileText
} from 'lucide-react';
import './alerts.css';

/**
 * Action button groups per alert lifecycle status
 * NEW           -> View, Acknowledge, Assign
 * ACKNOWLEDGED  -> View, Start Investigation, Assign
 * INVESTIGATING -> View, Add Note, Resolve, Generate Report
 * RESOLVED      -> View, Generate Report
 */
export const AlertActions = ({ alert, onAction }) => {
  const { status } = alert;

  return (
    <div className="alert-actions-group">
      <button className="btn btn-ghost btn-sm" onClick={() => onAction('view', alert)}>
        <Eye size={13} /> View
      </button>

      {status === 'New' && (
        <>
          <button className="btn btn-success btn-sm" onClick={() => onAction('acknowledge', alert)}>
            <CheckCircle size={13} /> Acknowledge
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => onAction('assign', alert)}>
            <UserPlus size={13} /> Assign
          </button>
        </>
      )}

      {status === 'Acknowledged' && (
        <>
          <button className="btn btn-warning btn-sm" onClick={() => onAction('investigate', alert)}>
            <Search size={13} /> Start Investigation
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => onAction('assign', alert)}>
            <UserPlus size={13} /> Assign
          </button>
        </>
      )}

      {status === 'Investigating' && (
        <>
          <button className="btn btn-secondary btn-sm" onClick={() => onAction('note', alert)}>
            <StickyNote size={13} /> Add Note
          </button>
          <button className="btn btn-success btn-sm" onClick={() => onAction('resolve', alert)}>
            <CheckSquare size={13} /> Resolve
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => onAction('report', alert)}>
            <FileText size={13} /> Report
          </button>
        </>
      )}

      {status === 'Resolved' && (
        <button className="btn btn-secondary btn-sm" onClick={() => onAction('report', alert)}>
          <FileText size={13} /> Generate Report
        </button>
      )}
    </div>
  );
};
