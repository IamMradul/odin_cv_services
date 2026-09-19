import React, { useState } from 'react';
import './reports.css';

const REPORT_TYPES = [
  'Suspicious Activity',
  'Incident',
  'Person Activity',
  'OSINT Findings',
  'Daily Summary',
];

const MOCK_ALERT_IDS = ['ALT-1042', 'ALT-1041', 'ALT-1040', 'ALT-1039'];
const MOCK_CLIP_IDS  = ['VID-01', 'VID-02', 'VID-03', 'VID-04'];

export const ReportBuilder = ({ onSubmit }) => {
  const [form, setForm] = useState({
    title: '',
    type: REPORT_TYPES[0],
    attachedAlerts: [],
    attachedClips: [],
    notes: '',
  });

  const toggle = (key, value) => {
    setForm(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value],
    }));
  };

  const handleSubmit = (action) => {
    if (!form.title.trim()) return;
    onSubmit?.({ ...form, action });
  };

  return (
    <div className="report-builder">
      <div className="rb-form">
        {/* Title */}
        <div className="rb-field">
          <label className="rb-label">Report Title *</label>
          <input
            type="text"
            placeholder="e.g. Suspicious Activity at Gate A - 2026-09-19"
            value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
          />
        </div>

        {/* Type */}
        <div className="rb-field">
          <label className="rb-label">Report Type</label>
          <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
            {REPORT_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        {/* Attach Alerts */}
        <div className="rb-field">
          <label className="rb-label">Attach Alerts</label>
          <div className="rb-checkbox-group">
            {MOCK_ALERT_IDS.map(id => (
              <label key={id} className="rb-checkbox-item">
                <input
                  type="checkbox"
                  checked={form.attachedAlerts.includes(id)}
                  onChange={() => toggle('attachedAlerts', id)}
                />
                <span>{id}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Attach Clips */}
        <div className="rb-field">
          <label className="rb-label">Attach Footage Clips</label>
          <div className="rb-checkbox-group">
            {MOCK_CLIP_IDS.map(id => (
              <label key={id} className="rb-checkbox-item">
                <input
                  type="checkbox"
                  checked={form.attachedClips.includes(id)}
                  onChange={() => toggle('attachedClips', id)}
                />
                <span>{id}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="rb-field">
          <label className="rb-label">Operator Notes</label>
          <textarea
            rows={5}
            placeholder="Add investigation notes, context, or instructions for the report…"
            value={form.notes}
            onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
          />
        </div>

        <div className="rb-actions">
          <button
            className="btn btn-secondary"
            onClick={() => handleSubmit('draft')}
            disabled={!form.title.trim()}
          >
            Save as Draft
          </button>
          <button
            className="btn btn-primary"
            onClick={() => handleSubmit('generate')}
            disabled={!form.title.trim()}
          >
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};
