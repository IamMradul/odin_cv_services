import React, { useState } from 'react';
import { SettingsSidebar } from '../components/settings/SettingsSidebar';
import { SettingsSection } from '../components/settings/SettingsSection';
import { ToggleSetting } from '../components/settings/ToggleSetting';
import { SelectSetting } from '../components/settings/SelectSetting';
import { SettingInput } from '../components/settings/SettingInput';
import '../components/settings/settings.css';

const SECTIONS = {
  camera: () => (
    <SettingsSection title="Camera Configuration">
      <SettingInput label="Camera Name" description="Friendly display name for this camera." defaultValue="Main Entrance" />
      <SettingInput label="Camera ID" description="Unique identifier used by the backend." defaultValue="CAM-01" />
      <SettingInput label="Location" description="Physical location of the camera." defaultValue="Gate A" />
      <SettingInput label="Stream URL" description="RTSP/HLS/WebRTC stream URL." placeholder="rtsp://..." type="text" />
      <ToggleSetting label="Enable Recording" description="Continuously record and save footage from this camera." defaultChecked={true} />
      <SelectSetting
        label="Display Order"
        description="Position of this camera in the live grid."
        options={[
          { value: '1', label: 'Position 1 (Top Left)' },
          { value: '2', label: 'Position 2 (Top Right)' },
          { value: '3', label: 'Position 3 (Bottom Left)' },
          { value: '4', label: 'Position 4 (Bottom Right)' },
        ]}
        defaultValue="1"
      />
    </SettingsSection>
  ),

  alerts: () => (
    <SettingsSection title="Alert Configuration">
      <ToggleSetting label="Enable Face Detection Alerts" description="Trigger alerts when an unrecognized face is detected." defaultChecked={true} />
      <ToggleSetting label="Enable Vehicle Alerts" description="Trigger alerts for suspicious vehicle activity." defaultChecked={true} />
      <ToggleSetting label="Enable Loitering Alerts" description="Trigger alerts when loitering is detected." defaultChecked={false} />
      <ToggleSetting label="Enable Tailgating Alerts" description="Trigger alerts when tailgating is detected at entry points." defaultChecked={true} />
      <ToggleSetting label="Notification Sounds" description="Play audio alerts on critical events." defaultChecked={true} />
      <SelectSetting
        label="Default Alert Severity"
        description="Minimum severity level to trigger a notification."
        options={[
          { value: 'info', label: 'Info and above' },
          { value: 'warning', label: 'Warning and above' },
          { value: 'critical', label: 'Critical only' },
        ]}
        defaultValue="warning"
      />
    </SettingsSection>
  ),

  ai: () => (
    <SettingsSection title="AI / Detection Parameters">
      <SelectSetting
        label="Detection Confidence Threshold"
        description="Minimum AI confidence required to flag an event."
        options={[
          { value: 'low', label: 'Low (70%) — More detections, more false positives' },
          { value: 'medium', label: 'Medium (85%) — Recommended' },
          { value: 'high', label: 'High (95%) — Fewer false positives' },
        ]}
        defaultValue="medium"
      />
      <ToggleSetting label="Facial Recognition" description="Cross-reference detected faces with the Face Database." defaultChecked={true} />
      <ToggleSetting label="Vehicle Make / Model Estimation" description="Attempt to classify vehicle make and model on perimeter cameras." defaultChecked={false} />
      <ToggleSetting label="Prioritize Restricted Areas" description="Automatically elevate severity for motion in marked zones." defaultChecked={true} />
      <SelectSetting
        label="Priority Mode"
        description="How events are ranked in the Priority Event Panel."
        options={[
          { value: 'severity', label: 'By severity' },
          { value: 'recency', label: 'By recency' },
          { value: 'combined', label: 'Combined score' },
        ]}
        defaultValue="combined"
      />
    </SettingsSection>
  ),

  tracking: () => (
    <SettingsSection title="Tracking Configuration">
      <SelectSetting
        label="Tracking Duration"
        description="How long to track an entity before dropping the track."
        options={[
          { value: '30', label: '30 seconds' },
          { value: '60', label: '1 minute' },
          { value: '300', label: '5 minutes' },
          { value: '600', label: '10 minutes' },
        ]}
        defaultValue="60"
      />
      <ToggleSetting label="Cross-Camera Tracking" description="Attempt to link tracks across different camera feeds." defaultChecked={true} />
      <ToggleSetting label="Priority Notifications for New Tracks" description="Send notification when a new entity begins tracking." defaultChecked={false} />
      <ToggleSetting label="Show Track History" description="Display track history trails on the live map." defaultChecked={true} />
    </SettingsSection>
  ),

  users: () => (
    <SettingsSection title="User & Access">
      <SelectSetting
        label="Your Role"
        description="Your current access level in the system."
        options={[
          { value: 'viewer', label: 'Viewer — Read-only' },
          { value: 'operator', label: 'Operator — Manage alerts' },
          { value: 'investigator', label: 'Investigator — Access OSINT pipeline' },
          { value: 'admin', label: 'Administrator — Full access' },
        ]}
        defaultValue="operator"
        disabled
      />
      <ToggleSetting label="Require 2FA" description="Require two-factor authentication on login." defaultChecked={false} disabled />
      <ToggleSetting label="Manage Other Users" description="Invite, remove, or change roles for other operators." defaultChecked={false} disabled />
      <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', padding: 'var(--space-3)', background: 'var(--surface-elevated)', borderRadius: 'var(--radius-input)' }}>
        Role changes must be performed by an Administrator. The backend is the authority for actual authorization.
      </p>
    </SettingsSection>
  ),

  storage: () => (
    <SettingsSection title="Storage & Retention">
      <SelectSetting
        label="Retention Policy"
        description="How long footage is kept before automatic deletion."
        options={[
          { value: '7', label: '7 days' },
          { value: '30', label: '30 days' },
          { value: '90', label: '90 days' },
          { value: '365', label: '1 year' },
        ]}
        defaultValue="30"
      />
      <ToggleSetting label="Auto-Archive Resolved Alerts" description="Automatically archive alerts marked as Resolved after 24 hours." defaultChecked={true} />
      <ToggleSetting label="Enable Backup" description="Daily encrypted backup of reports and alert records." defaultChecked={false} />
      <SelectSetting
        label="Export Format"
        description="Default format for exported reports."
        options={[
          { value: 'pdf', label: 'PDF' },
          { value: 'json', label: 'JSON' },
          { value: 'csv', label: 'CSV' },
        ]}
        defaultValue="pdf"
      />
    </SettingsSection>
  ),

  interface: () => (
    <SettingsSection title="Interface Preferences">
      <SelectSetting
        label="Application Theme"
        description="Visual appearance of the dashboard."
        options={[
          { value: 'dark', label: 'Dark Mode (Default)' },
          { value: 'light', label: 'Light Mode (Coming Soon)' },
        ]}
        defaultValue="dark"
      />
      <SelectSetting
        label="Dashboard Density"
        description="How tightly information is packed on screen."
        options={[
          { value: 'compact', label: 'Compact' },
          { value: 'comfortable', label: 'Comfortable' },
        ]}
        defaultValue="comfortable"
      />
      <SelectSetting
        label="Timezone"
        description="Local timezone for timestamps."
        options={[
          { value: 'UTC', label: 'UTC' },
          { value: 'IST', label: 'IST (Asia/Kolkata)' },
          { value: 'EST', label: 'EST (America/New_York)' },
        ]}
        defaultValue="IST"
      />
      <SelectSetting
        label="Date Format"
        description="How dates are displayed across the interface."
        options={[
          { value: 'iso', label: 'ISO — 2026-09-19' },
          { value: 'us', label: 'US — 09/19/2026' },
          { value: 'eu', label: 'EU — 19/09/2026' },
        ]}
        defaultValue="iso"
      />
      <ToggleSetting label="Show Event Tooltips on Hover" description="Display quick summaries when hovering over timeline events." defaultChecked={true} />
    </SettingsSection>
  ),
};

const Settings = () => {
  const [activeSection, setActiveSection] = useState('ai');
  const SectionComponent = SECTIONS[activeSection];

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1 className="page-title">System Settings</h1>
        <p className="page-subtitle">Configure system behavior, AI parameters, and interface preferences.</p>
      </div>

      <div className="settings-layout">
        <SettingsSidebar activeSection={activeSection} onSelectSection={setActiveSection} />

        <div className="settings-content-area">
          {SectionComponent ? <SectionComponent /> : null}
        </div>
      </div>
    </div>
  );
};

export default Settings;
