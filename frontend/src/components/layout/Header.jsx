import React, { useState, useEffect } from 'react';
import { Bell, User, ChevronDown, Shield, Menu, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MOCK_ALERTS } from '../../data/mockData';
import './layout.css';

const Header = ({ isSidebarOpen, onToggleSidebar }) => {
  const [now, setNow] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  const newAlerts = MOCK_ALERTS.filter(a => a.status === 'New');

  return (
    <header className="top-header">
      <div className="header-left">
        {!isSidebarOpen && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginRight: 'var(--space-4)' }}>
            <button className="icon-button" onClick={onToggleSidebar} aria-label="Toggle Sidebar">
              <Menu size={18} />
            </button>
            <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
              <div className="logo-icon-wrap">
                <Eye size={18} />
              </div>
              <div className="logo-text">
                <span className="logo-title">ODIN-CV</span>
                <span className="logo-sub">Surveillance System</span>
              </div>
            </div>
          </div>
        )}
        <div className="datetime-display">
          <span className="date-str">{dateStr}</span>
          <span className="time-str">{timeStr}</span>
        </div>
      </div>

      <div className="header-right">
        <div className="notification-wrapper">
          <button
            id="notification-btn"
            className="icon-button notification-btn"
            aria-label="Notifications"
            onClick={() => setShowNotifications(p => !p)}
          >
            <Bell size={18} />
            {newAlerts.length > 0 && (
              <span className="notification-badge">{newAlerts.length}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notif-header">
                <span>Notifications</span>
                <span className="notif-count">{newAlerts.length} new</span>
              </div>
              {newAlerts.map(alert => (
                <button
                  key={alert.id}
                  className="notif-item"
                  onClick={() => { navigate('/alerts'); setShowNotifications(false); }}
                >
                  <div className="notif-dot critical" />
                  <div className="notif-content">
                    <span className="notif-title">{alert.event}</span>
                    <span className="notif-meta">{alert.camera} · {alert.time}</span>
                  </div>
                </button>
              ))}
              {newAlerts.length === 0 && (
                <div className="notif-empty">No new alerts</div>
              )}
            </div>
          )}
        </div>

        <div className="user-profile">
          <div className="avatar">
            <User size={16} />
          </div>
          <div className="user-info">
            <span className="user-name">Operator 1</span>
            <span className="user-role">
              <Shield size={10} /> Security Team
            </span>
          </div>
          <ChevronDown size={14} className="text-muted" />
        </div>
      </div>
    </header>
  );
};

export default Header;
