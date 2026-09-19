import React from 'react';
import {
  Camera, Bell, Cpu, Navigation, Users,
  HardDrive, Monitor
} from 'lucide-react';
import './settings.css';

const sections = [
  { id: 'camera',    label: 'Camera',         icon: Camera },
  { id: 'alerts',    label: 'Alerts',         icon: Bell },
  { id: 'ai',        label: 'AI / Detection', icon: Cpu },
  { id: 'tracking',  label: 'Tracking',       icon: Navigation },
  { id: 'users',     label: 'User & Access',  icon: Users },
  { id: 'storage',   label: 'Storage',        icon: HardDrive },
  { id: 'interface', label: 'Interface',      icon: Monitor },
];

export const SettingsSidebar = ({ activeSection, onSelectSection }) => (
  <aside className="settings-sidebar">
    {sections.map(s => (
      <button
        key={s.id}
        className={`settings-nav-item ${activeSection === s.id ? 'active' : ''}`}
        onClick={() => onSelectSection(s.id)}
      >
        <s.icon size={16} />
        <span>{s.label}</span>
      </button>
    ))}
  </aside>
);
