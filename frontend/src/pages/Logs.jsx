import React, { useState } from 'react';
import { Search, Filter, AlertCircle, Info, CheckCircle, Terminal } from 'lucide-react';
import '../components/faces/faces.css';

const MOCK_LOGS = [
  { id: '1', timestamp: '2026-09-19 10:45:12', level: 'INFO', component: 'System', message: 'Camera CAM-01 initialized successfully.' },
  { id: '2', timestamp: '2026-09-19 10:46:03', level: 'WARN', component: 'Network', message: 'High latency detected on CAM-02 (250ms).' },
  { id: '3', timestamp: '2026-09-19 10:47:30', level: 'ERROR', component: 'Hardware', message: 'Connection lost to CAM-04 (Loading Dock).' },
  { id: '4', timestamp: '2026-09-19 10:50:11', level: 'INFO', component: 'OSINT', message: 'Automated background check completed for ID #8841.' },
  { id: '5', timestamp: '2026-09-19 10:52:45', level: 'INFO', component: 'Auth', message: 'Operator 1 successfully authenticated.' },
  { id: '6', timestamp: '2026-09-19 10:55:02', level: 'WARN', component: 'System', message: 'Disk space on volume /data reaching 85%.' },
  { id: '7', timestamp: '2026-09-19 10:58:19', level: 'INFO', component: 'System', message: 'Routine database backup completed.' },
];

const Logs = () => {
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = MOCK_LOGS.filter(log => {
    const matchesLevel = filterLevel === 'ALL' || log.level === filterLevel;
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.component.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const getLevelIcon = (level) => {
    switch (level) {
      case 'INFO': return <CheckCircle size={16} className="text-success" />;
      case 'WARN': return <AlertCircle size={16} className="text-warning" />;
      case 'ERROR': return <AlertCircle size={16} className="text-danger" />;
      default: return <Info size={16} />;
    }
  };

  const getLevelStyle = (level) => {
    switch (level) {
      case 'INFO': return { color: 'var(--success-color)', background: 'var(--success-light)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 };
      case 'WARN': return { color: 'var(--warning-color)', background: 'var(--warning-light)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 };
      case 'ERROR': return { color: 'var(--critical-color)', background: 'var(--critical-light)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 };
      default: return {};
    }
  };

  return (
    <div className="face-page">
      <div className="page-header">
        <div>
          <h1 className="page-title"><Terminal size={24} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }}/> System Logs</h1>
          <p className="page-subtitle">Real-time application events, diagnostic information, and audit trails.</p>
        </div>
      </div>

      <div className="face-filters-bar">
        <div className="search-bar-wrapper" style={{ flex: 1, maxWidth: 400 }}>
          <Search size={16} className="search-bar-icon" />
          <input
            type="text"
            className="search-bar-input"
            placeholder="Search logs by message or component…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ fontSize: 'var(--font-sm)' }}
          />
        </div>

        <select className="filter-select" value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
          <option value="ALL">All Levels</option>
          <option value="INFO">Info</option>
          <option value="WARN">Warning</option>
          <option value="ERROR">Error</option>
        </select>
      </div>

      <div style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--font-sm)' }}>
          <thead>
            <tr style={{ background: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600, color: 'var(--text-muted)' }}>Timestamp</th>
              <th style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600, color: 'var(--text-muted)' }}>Level</th>
              <th style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600, color: 'var(--text-muted)' }}>Component</th>
              <th style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600, color: 'var(--text-muted)' }}>Message</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map(log => (
              <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{log.timestamp}</td>
                <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {getLevelIcon(log.level)}
                    <span style={getLevelStyle(log.level)}>{log.level}</span>
                  </div>
                </td>
                <td style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 500 }}>{log.component}</td>
                <td style={{ padding: 'var(--space-3) var(--space-4)', width: '99%' }}>{log.message}</td>
              </tr>
            ))}
            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan="4" style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No logs found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Logs;
