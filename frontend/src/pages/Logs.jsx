import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, AlertCircle, Info, CheckCircle, Terminal, Clock } from 'lucide-react';
import '../components/faces/faces.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost';
const LOGGING_API = `${API_URL}:8006`;

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  // Set session start time on component mount (or app load)
  const sessionStartTime = useRef(new Date().toISOString());
  // Track the latest log timestamp we have received
  const lastTimestamp = useRef(sessionStartTime.current);

  useEffect(() => {
    let intervalId;

    const fetchLogs = async () => {
      try {
        const response = await fetch(`${LOGGING_API}/logs?since=${encodeURIComponent(lastTimestamp.current)}&limit=100`);
        if (!response.ok) throw new Error('Failed to fetch logs');
        
        const newLogs = await response.json();
        if (newLogs.length > 0) {
          // Format DB logs into UI format
          const formattedLogs = newLogs.map(log => {
            const isEntry = log.event_type === 'ENTRY';
            const identity = log.global_id || `Unknown ${log.object_subtype || log.object_type}`;
            const conf = log.confidence ? (log.confidence * 100).toFixed(1) : 'N/A';
            
            return {
              id: log.id,
              timestamp: log.timestamp.replace('T', ' ').substring(0, 19),
              rawTimestamp: log.timestamp,
              level: 'INFO', // Event logs are mostly INFO. Alerts go to the Alerts tab.
              component: log.source_id,
              message: `[${log.event_type}] ${identity} detected (Confidence: ${conf}%). ${!isEntry ? `Duration: ${log.duration_seconds?.toFixed(1)}s` : ''}`
            };
          });

          // Sort so newest is at the top
          formattedLogs.sort((a, b) => new Date(b.rawTimestamp) - new Date(a.rawTimestamp));
          
          setLogs(prev => {
            const combined = [...formattedLogs, ...prev];
            // Sort combined again just in case
            combined.sort((a, b) => new Date(b.rawTimestamp) - new Date(a.rawTimestamp));
            // Keep at most 500 logs in memory
            return combined.slice(0, 500);
          });
          
          // Update the lastTimestamp to the newest log we just fetched
          const maxTime = newLogs.reduce((max, log) => log.timestamp > max ? log.timestamp : max, lastTimestamp.current);
          lastTimestamp.current = maxTime;
        }
      } catch (err) {
        console.error('Error fetching logs:', err);
      }
    };

    // Fetch immediately, then every 2 seconds
    fetchLogs();
    intervalId = setInterval(fetchLogs, 2000);

    return () => clearInterval(intervalId);
  }, []);

  const filteredLogs = logs.filter(log => {
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
          <h1 className="page-title"><Terminal size={24} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }}/> Session Logs</h1>
          <p className="page-subtitle">Real-time event streams starting from when you opened this dashboard.</p>
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
                  Waiting for new events... (Session started at {sessionStartTime.current.replace('T', ' ').substring(0, 19)})
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
