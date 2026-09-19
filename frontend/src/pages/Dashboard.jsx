import React, { useState } from 'react';
import { MetricCard } from '../components/dashboard/MetricCard';
import { CameraCard } from '../components/dashboard/CameraCard';
import { CameraGrid } from '../components/dashboard/CameraGrid';
import { PriorityEventPanel } from '../components/dashboard/PriorityEventPanel';
import { MapPanel } from '../components/dashboard/MapPanel';
import { RecentAlerts } from '../components/dashboard/RecentAlerts';
import { EventTimeline } from '../components/dashboard/EventTimeline';
import { SystemHealth } from '../components/dashboard/SystemHealth';
import { useCameras } from '../hooks/useCameras';
import { useAlerts } from '../hooks/useAlerts';
import { useStats } from '../hooks/useStats';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { Video, Bell, Activity, Users, Zap, UserCheck, X } from 'lucide-react';
import '../components/dashboard/dashboard.css';

const DashboardFacePanel = ({ onClose }) => (
  <div className="dashboard-face-panel" style={{ width: '100%', height: '100%', flexShrink: 0, background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)', padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', animation: 'slide-in-right 0.3s ease' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-3)' }}>
      <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><UserCheck size={18} className="text-info" /> Face Detections</h3>
      <button className="icon-button" onClick={onClose}><X size={16}/></button>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', overflowY: 'auto' }}>
      <div style={{ padding: 'var(--space-3)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-input)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--info-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--info-color)' }}><Users size={20} /></div>
          <div>
            <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600 }}>Unknown Individual</div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Main Entrance · 2 mins ago</div>
          </div>
        </div>
        <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>Run OSINT</button>
      </div>
      
      <div style={{ padding: 'var(--space-3)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-input)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success-color)' }}><UserCheck size={20} /></div>
          <div>
            <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600 }}>Employee Match</div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Lobby · 15 mins ago</div>
          </div>
        </div>
        <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>View Profile</button>
      </div>
    </div>
  </div>
);

const DashboardCameraPanel = ({ onClose }) => (
  <div className="dashboard-camera-panel" style={{ width: '100%', height: '100%', flexShrink: 0, background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)', padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', animation: 'slide-in-right 0.3s ease' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-3)' }}>
      <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Video size={18} className="text-warning" /> Camera Status</h3>
      <button className="icon-button" onClick={onClose}><X size={16}/></button>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', overflowY: 'auto' }}>
      <div style={{ padding: 'var(--space-3)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-input)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--warning-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning-color)' }}><Video size={20} /></div>
          <div>
            <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600 }}>CAM-04 Offline</div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Loading Dock · 1 hr ago</div>
          </div>
        </div>
        <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>Ping Camera</button>
      </div>
      <div style={{ padding: 'var(--space-3)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-input)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--info-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--info-color)' }}><Zap size={20} /></div>
          <div>
            <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600 }}>Network Latency</div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>CAM-02 (Parking) · Intermittent</div>
          </div>
        </div>
        <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>Diagnostics</button>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { cameras, isLoading, error, refetch } = useCameras();
  const { alerts } = useAlerts();
  const { stats } = useStats();
  
  const [simulateAlert, setSimulateAlert] = useState(false);
  const [activePanel, setActivePanel] = useState(null); // 'face' | 'camera' | null
  const [expandedCamera, setExpandedCamera] = useState(null);

  const onlineCameras = cameras.filter(c => c.status !== 'offline').length;
  const totalCameras = cameras.length;
  const activeCams = cameras.map(c =>
    c.id === 'CAM-01' && simulateAlert ? { ...c, status: 'priority', priority: true } : c
  );
  
  const activeAlertsCount = alerts ? alerts.filter(a => a.status === 'Active').length : 0;
  const trackedEntities = stats?.active_objects || 0;

  return (
    <div className="dashboard-page">
      {/* ── Section 1: Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Operational Dashboard</h1>
          <p className="page-subtitle">Live camera feeds, alerts, and system intelligence</p>
        </div>
        <button
          className={`btn ${simulateAlert ? 'btn-danger' : 'btn-primary'}`}
          onClick={() => setSimulateAlert(p => !p)}
        >
          <Zap size={16} />
          {simulateAlert ? 'Clear Simulated Alert' : 'Simulate Critical Alert'}
        </button>
      </div>

      {/* ── Section 2: Metrics ── */}
      <div className="metrics-grid">
        <div onClick={() => setActivePanel(p => p === 'face' ? null : 'face')} style={{ cursor: 'pointer' }}>
          <MetricCard
            title="Face Detections"
            value="12"
            icon={UserCheck}
            color="info"
            subtitle="2 unknown faces"
          />
        </div>
        <div onClick={() => setActivePanel(p => p === 'camera' ? null : 'camera')} style={{ cursor: 'pointer' }}>
          <MetricCard
            title="Cameras Online"
            value={isLoading ? '—' : `${onlineCameras} / ${totalCameras}`}
            icon={Video}
            color={onlineCameras < totalCameras ? 'warning' : 'success'}
            subtitle={`${totalCameras - onlineCameras} offline`}
          />
        </div>
        <MetricCard
          title="Active Alerts"
          value={activeAlertsCount.toString()}
          icon={Bell}
          color={activeAlertsCount > 0 ? 'critical' : 'success'}
        />
        <MetricCard
          title="Tracked Entities"
          value={trackedEntities.toString()}
          icon={Users}
          color="info"
        />
      </div>

      {/* ── Section 3: Priority Event ── */}
      <PriorityEventPanel />

      {/* ── Section 4+5: Camera Grid + Map + Panel ── */}
      <div className="dashboard-main-grid" style={{ gridTemplateColumns: activePanel ? '4fr 3fr' : '1fr 340px', transition: 'grid-template-columns 0.3s ease' }}>
        <div>
          <h2 className="section-title"><Video size={16} /> Live Feeds</h2>
          {isLoading ? (
            <LoadingState rows={4} />
          ) : error ? (
            <ErrorState message="Unable to load camera feeds." onRetry={refetch} />
          ) : (
            <CameraGrid>
              {activeCams.map(cam => (
                <CameraCard key={cam.id} camera={cam} onExpand={() => setExpandedCamera(cam)} />
              ))}
            </CameraGrid>
          )}
        </div>
        
        {!activePanel ? (
          <div style={{ animation: 'fade-in 0.3s ease', height: '100%' }}>
            <h2 className="section-title">Live Map</h2>
            <MapPanel />
          </div>
        ) : (
          <div style={{ animation: 'fade-in 0.3s ease', display: 'flex', flexDirection: 'column', height: '100%' }}>
            {activePanel === 'face' && <DashboardFacePanel onClose={() => setActivePanel(null)} />}
            {activePanel === 'camera' && <DashboardCameraPanel onClose={() => setActivePanel(null)} />}
          </div>
        )}
      </div>

      {/* ── Section 6+8: Recent Alerts + System Health ── */}
      <div className="dashboard-bottom-grid">
        <div>
          <h2 className="section-title"><Bell size={16} /> Recent Alerts</h2>
          <RecentAlerts />
        </div>
        <div>
          <h2 className="section-title"><Activity size={16} /> System Health</h2>
          <SystemHealth />
        </div>
      </div>

      {/* ── Section 7: Event Timeline ── */}
      <div style={{ marginTop: 'var(--space-6)' }}>
        <h2 className="section-title">Event Timeline</h2>
        <EventTimeline />
      </div>

      {/* ── Section 9: Expanded Camera Modal ── */}
      {expandedCamera && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', flexDirection: 'column', padding: '20px', animation: 'fade-in 0.2s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, color: 'white' }}>{expandedCamera.name} <span style={{ color: '#888', fontSize: '0.8em' }}>({expandedCamera.id})</span></h2>
            <button className="icon-button" onClick={() => setExpandedCamera(null)} style={{ color: '#fff', background: 'rgba(255,255,255,0.1)' }}><X size={24} /></button>
          </div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '100%', maxWidth: '1200px' }}>
              <CameraCard camera={expandedCamera} onExpand={() => setExpandedCamera(null)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
