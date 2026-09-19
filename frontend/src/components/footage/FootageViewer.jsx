import React, { useState, useRef } from 'react';
import { X, Play, Pause, SkipBack, SkipForward, Maximize2, Camera, Download } from 'lucide-react';
import { FootageTimeline } from './FootageTimeline';
import './footage.css';

const MOCK_CLIP_EVENTS = [
  { label: 'Face detected', severity: 'warning' },
  { label: 'Motion', severity: 'info' },
  { label: 'Alert triggered', severity: 'critical' },
];

export const FootageViewer = ({ clip, isOpen, onClose }) => {
  const [playing, setPlaying] = useState(false);
  const [frame, setFrame] = useState(0);
  const videoRef = useRef();
  const totalFrames = 300;

  if (!clip) return null;

  const togglePlay = () => {
    if (videoRef.current) {
      if (playing) videoRef.current.pause();
      else videoRef.current.play();
      setPlaying(p => !p);
    }
  };

  const prevFrame = () => setFrame(f => Math.max(0, f - 1));
  const nextFrame = () => setFrame(f => Math.min(totalFrames - 1, f + 1));

  return (
    <>
      <div className={`footage-viewer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <div className={`footage-viewer-panel ${isOpen ? 'open' : ''}`}>
        <div className="fvp-header">
          <div>
            <h2 className="fvp-title">{clip.title}</h2>
            <p className="fvp-meta">{clip.camera} · {clip.date} · {clip.time}</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button className="btn btn-secondary btn-sm"><Download size={13} /> Export</button>
            <button className="icon-button" onClick={onClose}><X size={18} /></button>
          </div>
        </div>

        <div className="fvp-body">
          {/* Video */}
          <div className="fvp-screen">
            <video
              ref={videoRef}
              src="/footage.mp4"
              className="fvp-video"
              loop muted playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div className="fvp-meta-overlay">
              <span>{clip.cameraId}</span>
              <span className="font-mono">{clip.time?.split('–')[0]}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="fvp-controls">
            <button className="icon-button" onClick={prevFrame} aria-label="Previous frame"><SkipBack size={18} /></button>
            <button className="icon-button fvp-play-btn" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
              {playing ? <Pause size={22} /> : <Play size={22} />}
            </button>
            <button className="icon-button" onClick={nextFrame} aria-label="Next frame"><SkipForward size={18} /></button>

            <div className="fvp-scrubber-wrap">
              <input
                type="range"
                min={0}
                max={totalFrames - 1}
                value={frame}
                onChange={e => setFrame(Number(e.target.value))}
                className="fv-range"
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ flex: 'none', display: 'flex', gap: 'var(--space-2)' }}>
              <button className="btn btn-secondary btn-sm"><Camera size={13} /> Snapshot</button>
              <button className="icon-button" aria-label="Fullscreen"><Maximize2 size={16} /></button>
            </div>
          </div>

          {/* Event Timeline */}
          <div className="fvp-timeline-section">
            <h4 className="fvp-section-title">Event Timeline ({clip.events} events)</h4>
            <FootageTimeline events={clip.events > 0 ? MOCK_CLIP_EVENTS.slice(0, clip.events) : []} />
          </div>

          {/* Metadata */}
          <div className="fvp-info-grid">
            <div className="fvp-info-item"><span>Camera</span><strong>{clip.camera}</strong></div>
            <div className="fvp-info-item"><span>Duration</span><strong className="font-mono">{clip.duration}</strong></div>
            <div className="fvp-info-item"><span>Date</span><strong>{clip.date}</strong></div>
            <div className="fvp-info-item"><span>ID</span><strong className="font-mono">{clip.id}</strong></div>
          </div>
        </div>
      </div>
    </>
  );
};
