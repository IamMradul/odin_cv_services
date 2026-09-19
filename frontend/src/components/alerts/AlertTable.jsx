import React from 'react';
import { Badge } from '../common/Badge';
import { AlertStatusBadge } from './AlertStatusBadge';
import { AlertActions } from './AlertActions';
import './alerts.css';

const SEV_VARIANT = {
  Critical: 'critical',
  Warning:  'warning',
  Info:     'info',
};

export const AlertTable = ({ alerts, onRowClick, onAction }) => {
  return (
    <div className="alert-table-container">
      <table className="alert-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Time</th>
            <th>Camera</th>
            <th>Location</th>
            <th>Entity</th>
            <th>Event</th>
            <th>Severity</th>
            <th>Status</th>
            <th>Assigned</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert) => (
            <tr
              key={alert.id}
              className={`alert-row sev-${alert.severity.toLowerCase()}`}
              onClick={() => onRowClick(alert)}
            >
              <td><span className="alert-id">{alert.id}</span></td>
              <td><span className="font-mono text-muted">{alert.time}</span></td>
              <td>{alert.camera}</td>
              <td className="text-muted">{alert.location}</td>
              <td><span className="font-mono text-secondary">{alert.entity || '—'}</span></td>
              <td>{alert.event}</td>
              <td>
                <Badge variant={SEV_VARIANT[alert.severity] || 'neutral'}>
                  {alert.severity}
                </Badge>
              </td>
              <td onClick={e => e.stopPropagation()}>
                <AlertStatusBadge status={alert.status} />
              </td>
              <td className="text-muted">{alert.assigned || '—'}</td>
              <td onClick={e => e.stopPropagation()}>
                <AlertActions alert={alert} onAction={onAction} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
