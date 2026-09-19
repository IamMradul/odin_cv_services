import React from 'react';
import { ReportStatus } from './ReportStatus';
import { Calendar, User, Download, Eye, RefreshCw } from 'lucide-react';
import './reports.css';

export const ReportCard = ({ report, onView, onGenerate }) => {
  const isGenerating = ['Queued', 'Generating'].includes(report.status);

  return (
    <div className="report-card">
      <div className="rc-header">
        <div className="rc-type-badge">{report.type}</div>
        <ReportStatus status={report.status} />
      </div>

      <h3 className="rc-title">{report.title}</h3>

      <div className="rc-meta">
        <span><User size={12} /> {report.author}</span>
        <span><Calendar size={12} /> {report.date}</span>
      </div>

      {isGenerating && (
        <div className="rc-progress">
          <div className="rc-progress-bar">
            <div
              className="rc-progress-fill"
              style={{ width: report.status === 'Queued' ? '15%' : '60%' }}
            />
          </div>
          <span className="rc-progress-label">
            {report.status === 'Queued' ? 'Queued…' : 'Generating…'}
          </span>
        </div>
      )}

      <div className="rc-actions">
        {report.status === 'Ready' && (
          <>
            <button className="btn btn-primary btn-sm" onClick={() => onView?.(report)}>
              <Eye size={13} /> View
            </button>
            <button className="btn btn-secondary btn-sm">
              <Download size={13} /> Export
            </button>
          </>
        )}
        {report.status === 'Draft' && (
          <button className="btn btn-primary btn-sm" onClick={() => onGenerate?.(report.id)}>
            <RefreshCw size={13} /> Generate
          </button>
        )}
        {report.status === 'Failed' && (
          <button className="btn btn-danger btn-sm" onClick={() => onGenerate?.(report.id)}>
            <RefreshCw size={13} /> Retry
          </button>
        )}
      </div>
    </div>
  );
};
