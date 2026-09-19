import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Search, Bell, Users,
  Video, FileText, Settings, Eye, Radio, X, Terminal
} from 'lucide-react';
import './layout.css';

const navItems = [
  { path: '/',        label: 'Dashboard',        icon: LayoutDashboard, exact: true },
  { path: '/search',  label: 'Search',           icon: Search },
  { path: '/alerts',  label: 'Alerts',           icon: Bell },
  { path: '/faces',   label: 'Face DB',          icon: Users },
  { path: '/footage', label: 'Footage',          icon: Video },
  { path: '/reports', label: 'Reports',          icon: FileText },
  { path: '/logs',    label: 'System Logs',      icon: Terminal },
  { path: '/settings',label: 'Settings',         icon: Settings },
];

const Sidebar = ({ isOpen, onToggleSidebar }) => {
  const [wsStatus, setWsStatus] = useState('connecting');
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setWsStatus('live'), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <aside className={`sidebar ${!isOpen ? 'collapsed' : ''}`}>
      <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="logo-icon-wrap">
            <Eye size={18} />
          </div>
          <div className="logo-text">
            <span className="logo-title">ODIN-CV</span>
            <span className="logo-sub">Surveillance System</span>
          </div>
        </div>
        <button className="icon-button" onClick={onToggleSidebar} aria-label="Close Sidebar" style={{ background: 'transparent' }}>
          <X size={18} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className={`ws-indicator ${wsStatus}`}>
          <Radio size={13} />
          <span>{wsStatus === 'live' ? 'Live' : 'Connecting…'}</span>
        </div>
        <div className="system-status">
          <div className={`status-dot online`} />
          <span>System Online</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
