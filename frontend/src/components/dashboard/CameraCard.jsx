import React from 'react';
import { Badge } from '../common/Badge';
import { OfflineState } from '../common/OfflineState';
import { DetectionOverlay } from './DetectionOverlay';
import { Maximize2, AlertTriangle } from 'lucide-react';
import { useCameraStream } from '../../hooks/useCameraStream';
import './dashboard.css';

export const CameraCard = ({ camera, onExpand }) => {
  const { id, name, location, status: dbStatus, priority, lastSeen, detections = [] } = camera;
  const { canvasRef, status: streamStatus, detections: liveDetections, fps } = useCameraStream(id);

  // Consider it offline if either the DB says it's offline or the stream is offline
  const effectiveStatus = (dbStatus === 'offline' || streamStatus === 'offline') ? 'offline' : dbStatus;

  let badgeVariant = 'success';
  let badgeText = 'Online';
  let cardExtraClass = '';

  if (effectiveStatus === 'warning') {
    badgeVariant = 'warning';
    badgeText = 'Warning';
    cardExtraClass = 'camera-warning';
  } else if (effectiveStatus === 'offline') {
    badgeVariant = 'offline';
    badgeText = 'Offline';
    cardExtraClass = 'camera-offline';
  }

  if (priority) {
    badgeVariant = 'critical';
    badgeText = 'High Priority';
    cardExtraClass = 'camera-priority';
  }

  return (
    <div className={`camera-card ${cardExtraClass}`}>
      <div className="camera-feed-container">
        {effectiveStatus === 'offline' ? (
          <OfflineState lastSeen={lastSeen} />
        ) : (
          <div className="mock-feed">
            <canvas
              ref={canvasRef}
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            />
            {/* Keeping DetectionOverlay for static detections if any, though drawOverlays handles it for canvas */}
            {priority && (
              <div className="priority-overlay">
                <AlertTriangle size={16} className="priority-pulse" />
                <span>High Priority Event</span>
              </div>
            )}
            {/* HUD Overlay */}
            <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.6)', padding: '10px', borderRadius: '8px', color: '#fff', fontSize: '12px', fontFamily: 'monospace', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', borderLeft: '3px solid #ccc', paddingLeft: '8px', color: '#ccc' }}>
                source: {id} | fps: {fps || 0}
              </div>
              <div style={{ display: 'flex', borderLeft: `3px solid ${liveDetections?.human?.ok ? '#00ff00' : '#ff4444'}`, paddingLeft: '8px', color: liveDetections?.human?.ok ? '#00ff00' : '#ff4444' }}>
                human: {liveDetections?.human?.ok ? `${liveDetections.human.detections.length} found` : 'down'}
              </div>
              <div style={{ display: 'flex', borderLeft: `3px solid ${liveDetections?.vehicle?.ok ? '#00ff00' : '#ff4444'}`, paddingLeft: '8px', color: liveDetections?.vehicle?.ok ? '#00ff00' : '#ff4444' }}>
                vehicle: {liveDetections?.vehicle?.ok ? `${liveDetections.vehicle.detections.length} found` : 'down'}
              </div>
              <div style={{ display: 'flex', borderLeft: `3px solid ${liveDetections?.anpr?.ok ? '#00ff00' : '#ff4444'}`, paddingLeft: '8px', color: liveDetections?.anpr?.ok ? '#00ff00' : '#ff4444' }}>
                anpr: {liveDetections?.anpr?.ok ? `${liveDetections.anpr.detections.length} found` : 'down'}
              </div>
              <div style={{ display: 'flex', borderLeft: `3px solid ${liveDetections?.suspicious?.ok ? '#00ff00' : '#ff4444'}`, paddingLeft: '8px', color: liveDetections?.suspicious?.ok ? '#00ff00' : '#ff4444' }}>
                suspicious: {liveDetections?.suspicious?.ok ? `${liveDetections.suspicious.detections.length} found` : 'down'}
              </div>
              <div style={{ display: 'flex', borderLeft: `3px solid ${liveDetections?.face?.ok ? '#00ff00' : '#ff4444'}`, paddingLeft: '8px', color: liveDetections?.face?.ok ? '#00ff00' : '#ff4444' }}>
                face: {liveDetections?.face?.ok ? `${liveDetections.face.detections.length} found` : 'down'}
              </div>
            </div>

            {effectiveStatus === 'warning' && (
              <div className="warning-banner">
                <AlertTriangle size={12} /> Motion in Restricted Area
              </div>
            )}
          </div>
        )}
        <div className="camera-controls">
          <button className="icon-button light" aria-label="Fullscreen" onClick={onExpand}>
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      <div className="camera-info">
        <div className="camera-info-row">
          <h4 className="camera-name">{name}</h4>
          <Badge variant={badgeVariant} dot>{badgeText}</Badge>
        </div>
        <div className="camera-meta">
          <span className="camera-id">{id}</span>
          <span className="meta-sep">·</span>
          <span>{location}</span>
          {detections.length > 0 && (
            <>
              <span className="meta-sep">·</span>
              <span className="text-info">{detections.length} detection{detections.length > 1 ? 's' : ''}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
