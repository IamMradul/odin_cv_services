import React, { useState } from 'react';
import { MetricCard } from '../components/dashboard/MetricCard';
import { CameraCard } from '../components/dashboard/CameraCard';
import { CameraGrid } from '../components/dashboard/CameraGrid';
import { MapPanel } from '../components/dashboard/MapPanel';
import { useCameras } from '../hooks/useCameras';
import { useAlerts } from '../hooks/useAlerts';
import { useStats } from '../hooks/useStats';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { Video, Bell, Activity, Users, Zap, UserCheck, X, ShieldAlert } from 'lucide-react';
import '../components/dashboard/dashboard.css';

const PriorityEventOverlay = ({ alert, onDismiss }) => {
  if (!alert) return null;
  return (
    <div className="priority-event-overlay">
      <div className="pep-alert-bar"></div>
      <div className="pep-content">
        <div className="pep-header">
          <ShieldAlert size={16} className="text-critical" />
          <span className="pep-label">Priority Event Detected</span>
        </div>
        <div className="pep-event">{alert.title}</div>
        <div className="pep-meta">{alert.location} • {alert.time}</div>
      </div>
      <button className="btn btn-danger btn-sm" onClick={onDismiss}>Dismiss</button>
      <button className="btn btn-primary btn-sm">View Details</button>
    </div>
  );
};

const Dashboard = () => {
  const { cameras, isLoading, error, refetch } = useCameras();
  const { alerts } = useAlerts();
  const { stats } = useStats();
  
  const [simulateAlert, setSimulateAlert] = useState(false);
  const [expandedCamera, setExpandedCamera] = useState(null);

  const onlineCameras = cameras.filter(c => c.status !== 'offline').length;
  const totalCameras = cameras.length;
  const activeCams = cameras.map(c =>
    c.id === 'CAM-01' && simulateAlert ? { ...c, status: 'priority', priority: true } : c
  );
  
  const activeAlertsCount = alerts ? alerts.filter(a => a.status === 'Active').length : 0;
  const trackedEntities = stats?.active_objects || 0;

  const simulatedPriorityEvent = simulateAlert ? {
    title: "Unauthorized Access Detected",
    location: "Main Gate (CAM-01)",
    time: "Just now"
  } : null;

  return (
    <div className="dashboard-cockpit">
      {/* ── Left Panel: Metrics ── */}
      <div className="cockpit-panel-left">
        <div className="cockpit-title">System Metrics</div>
        
        <MetricCard
          title="Face Detections"
          value="12"
          icon={UserCheck}
          color="info"
          subtitle="2 unknown faces"
        />
        
        <MetricCard
          title="Cameras Online"
          value={isLoading ? '—' : `${onlineCameras} / ${totalCameras}`}
          icon={Video}
          color={onlineCameras < totalCameras ? 'warning' : 'success'}
          subtitle={`${totalCameras - onlineCameras} offline`}
        />
        
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

      {/* ── Center Panel: Hero Area ── */}
      <div className="cockpit-main">
        <div className="cockpit-main-split">
          <div>
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
          <div>
            <MapPanel />
          </div>
        </div>
      </div>

      {/* ── Right Panel: Alerts & Controls ── */}
      <div className="cockpit-panel-right">
        <div className="cockpit-title">Recent Alerts</div>
        
        <div className="glass-panel">
          <div className="recent-alerts-list">
            {alerts && alerts.slice(0, 4).map(alert => {
              const timeString = alert.time || (alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString() : 'Unknown Time');
              const title = alert.title || alert.alert_type || 'Alert';
              const status = alert.status || (alert.acknowledged ? 'Acknowledged' : 'New');
              const severity = (alert.severity || 'info').toLowerCase();
              return (
                <div key={alert.id} className="ra-item">
                  <div className="ra-severity-bar" data-sev={severity}></div>
                  <div className="ra-body">
                    <div className="ra-event">{title}</div>
                    <div className="ra-meta">{timeString} • {status}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-panel" style={{ marginTop: 'auto' }}>
          <h4 style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>Debug Controls</h4>
          <button
            className={`btn ${simulateAlert ? 'btn-danger' : 'btn-primary'}`}
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => setSimulateAlert(p => !p)}
          >
            <Zap size={16} />
            {simulateAlert ? 'Clear Alert' : 'Simulate Alert'}
          </button>
        </div>
      </div>

      {/* ── Priority Event Overlay ── */}
      <PriorityEventOverlay 
        alert={simulatedPriorityEvent} 
        onDismiss={() => setSimulateAlert(false)} 
      />

      {/* ── Expanded Camera Modal ── */}
      {expandedCamera && (
        <div className="dashboard-modal-overlay">
          <div className="dashboard-modal-header">
            <h2 className="dashboard-modal-title">
              {expandedCamera.name} <span style={{ color: 'var(--text-muted)', fontSize: '0.6em', fontFamily: 'var(--font-mono)' }}>({expandedCamera.id})</span>
            </h2>
            <button className="icon-button light" onClick={() => setExpandedCamera(null)}><X size={24} /></button>
          </div>
          <div className="dashboard-modal-content">
            <div style={{ width: '100%', maxWidth: '1400px', height: '80vh' }}>
              <CameraCard camera={expandedCamera} onExpand={() => setExpandedCamera(null)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
