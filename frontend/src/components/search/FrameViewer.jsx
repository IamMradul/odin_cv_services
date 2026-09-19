import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Play, Pause, SkipBack, SkipForward, Maximize2, Camera } from 'lucide-react';
import './search.css';

export const FrameViewer = ({ result, isOpen, onClose }) => {
  const [playing, setPlaying] = useState(false);
  const [frame, setFrame] = useState(0);
  const totalFrames = 120;

  if (!result) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Frame Viewer — ${result.camera}`} size="lg">
      <div className="frame-viewer">
        <div className="fv-screen">
          <video
            src="/footage.mp4"
            className="fv-video"
            autoPlay={playing}
            loop
            muted
            playsInline
          />
          <div className="fv-overlay-info">
            <span className="fv-cam">{result.camera}</span>
            <span className="fv-ts">{result.timestamp}</span>
          </div>
          <div className="fv-confidence">
            <span>Confidence: <strong>{result.confidence}%</strong></span>
          </div>
        </div>

        <div className="fv-scrubber">
          <input
            type="range"
            min="0"
            max={totalFrames - 1}
            value={frame}
            onChange={e => setFrame(Number(e.target.value))}
            className="fv-range"
          />
          <div className="fv-range-labels">
            <span>Frame 0</span>
            <span>Frame {totalFrames - 1}</span>
          </div>
        </div>

        <div className="fv-controls">
          <button className="icon-button" onClick={() => setFrame(f => Math.max(0, f - 1))} aria-label="Previous frame">
            <SkipBack size={18} />
          </button>
          <button
            className="icon-button fv-play-btn"
            onClick={() => setPlaying(p => !p)}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? <Pause size={22} /> : <Play size={22} />}
          </button>
          <button className="icon-button" onClick={() => setFrame(f => Math.min(totalFrames - 1, f + 1))} aria-label="Next frame">
            <SkipForward size={18} />
          </button>
          <div style={{ flex: 1 }} />
          <button className="btn btn-secondary btn-sm">
            <Camera size={13} /> Snapshot
          </button>
          <button className="icon-button" aria-label="Fullscreen">
            <Maximize2 size={16} />
          </button>
        </div>

        <div className="fv-result-info">
          <p className="fv-title">{result.title}</p>
          <p className="fv-meta text-muted">Camera: {result.camera} · Timestamp: {result.timestamp}</p>
        </div>
      </div>
    </Modal>
  );
};
