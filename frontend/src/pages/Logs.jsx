import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, AlertCircle, Info, CheckCircle, Terminal, Clock } from 'lucide-react';
import '../components/faces/faces.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost';
const LOGGING_API = `${API_URL}:8006`;

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [hideUnknowns, setHideUnknowns] = useState(false);
  // Start with an empty timestamp to fetch the most recent historical logs on first load.
  const lastTimestamp = useRef('');
  const isFetching = useRef(false);

  useEffect(() => {
    let intervalId;

    const fetchLogs = async () => {
      if (isFetching.current) return;
      isFetching.current = true;
      try {
        const url = `${LOGGING_API}/logs?limit=100${lastTimestamp.current ? `&since=${encodeURIComponent(lastTimestamp.current)}` : ''}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch logs');
        
        const newLogs = await response.json();
        if (newLogs.length > 0) {
          // Format DB logs into UI format
          const formattedLogs = newLogs.map(log => {
            const isEntry = log.event_type === 'ENTRY';
            const subtypeText = log.object_subtype ? ` [${log.object_subtype.toUpperCase()}]` : '';
            const identity = log.global_id ? `${log.global_id}${subtypeText}` : `Unknown ${log.object_subtype || log.object_type}`;
            const conf = log.confidence ? (log.confidence * 100).toFixed(1) : 'N/A';
            const message = `[${log.event_type}] ${identity} detected (Confidence: ${conf}%). ${!isEntry ? `Duration: ${log.duration_seconds?.toFixed(1)}s` : ''}`;
            
            let level = 'INFO';
            const msgLower = message.toLowerCase();
            const subtypeLower = (log.object_subtype || '').toLowerCase();
            const isHexId = /^[0-9a-f]{16,32}/i.test(log.global_id || ''); // Check if identity is a UUID/hash

            if (msgLower.includes('threat') || msgLower.includes('armed') || msgLower.includes('suspicious') || msgLower.includes('critical') || subtypeLower.includes('threat')) {
              level = 'CRITICAL';
            } else if (msgLower.includes('safe') || subtypeLower.includes('safe')) {
              level = 'SAFE';
            } else if (msgLower.includes('unidentified') || msgLower.includes('unrecognized') || msgLower.includes('unknown') || subtypeLower.includes('unidentified') || isHexId) {
              level = 'UNKNOWN';
            }

            return {
              id: log.id,
              timestamp: log.timestamp.replace('T', ' ').substring(0, 19),
              rawTimestamp: log.timestamp,
              level: level,
              component: log.source_id,
              message: message
            };
          });

          setLogs(prev => {
            const existingIds = new Set(prev.map(l => l.id));
            const uniqueNewLogs = formattedLogs.filter(l => !existingIds.has(l.id));
            
            if (uniqueNewLogs.length === 0) return prev;
            
            const combined = [...uniqueNewLogs, ...prev];
            // Sort combined again just in case
            combined.sort((a, b) => new Date(b.rawTimestamp) - new Date(a.rawTimestamp));
            // Keep at most 500 logs in memory
            return combined.slice(0, 500);
          });
          
          // Update the lastTimestamp to the newest log we just fetched
          const maxTime = newLogs.reduce((max, log) => (max === '' || log.timestamp > max) ? log.timestamp : max, lastTimestamp.current);
          lastTimestamp.current = maxTime;
        }
      } catch (err) {
        console.error('Error fetching logs:', err);
      } finally {
        isFetching.current = false;
      }
    };

    // Fetch immediately, then every 2 seconds
    fetchLogs();
    intervalId = setInterval(fetchLogs, 2000);

    return () => clearInterval(intervalId);
  }, []);

  const filteredLogs = logs.filter(log => {
    if (hideUnknowns && log.level === 'UNKNOWN') return false;
    const matchesLevel = filterLevel === 'ALL' || log.level === filterLevel;
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.component.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const getLevelIcon = (level) => {
    switch (level) {
      case 'SAFE':
      case 'INFO': return <CheckCircle size={16} className="text-success" />;
      case 'UNKNOWN': return <Info size={16} style={{ color: '#c084fc' }} />;
      case 'CRITICAL':
      case 'ERROR': return <AlertCircle size={16} className="text-danger" />;
      case 'WARN': return <AlertCircle size={16} className="text-warning" />;
      default: return <Info size={16} />;
    }
  };

  const getLevelStyle = (level) => {
    switch (level) {
      case 'SAFE':
      case 'INFO': return { color: 'var(--success-color)', background: 'var(--success-light)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 };
      case 'UNKNOWN': return { color: '#c084fc', background: '#f3e8ff', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 };
      case 'CRITICAL':
      case 'ERROR': return { color: 'var(--critical-color)', background: 'var(--critical-light)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 };
      case 'WARN': return { color: 'var(--warning-color)', background: 'var(--warning-light)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 };
      default: return {};
    }
  };

  const handleExportJson = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session_logs_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="face-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title"><Terminal size={24} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }}/> Session Logs</h1>
          <p className="page-subtitle">Real-time event streams starting from when you opened this dashboard.</p>
        </div>
        <button className="btn btn-secondary" onClick={handleExportJson}>
          Export JSON
        </button>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input 
              type="checkbox" 
              id="hideUnknowns" 
              checked={hideUnknowns} 
              onChange={(e) => setHideUnknowns(e.target.checked)} 
            />
            <label htmlFor="hideUnknowns" style={{ fontSize: 'var(--font-sm)', color: 'var(--text-color)', cursor: 'pointer', margin: 0 }}>
              Hide Unknowns
            </label>
          </div>
          
          <select className="filter-select" value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
            <option value="ALL">All Levels</option>
            <option value="INFO">Info</option>
            <option value="SAFE">Safe</option>
            <option value="UNKNOWN">Unknown</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>

      <div style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--font-sm)' }}>
          <thead>
            <tr style={{ background: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600, color: 'var(--text-muted)' }}>Timestamp</th>
              <th style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600, color: 'var(--text-muted)' }}>Level</th>
              <th style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600, color: 'var(--text-muted)' }}>Source Camera</th>
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
                  <Clock size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.5 }} />
                  No events found. Waiting for new events...
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
