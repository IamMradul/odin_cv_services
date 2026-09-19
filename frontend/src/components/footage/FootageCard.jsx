import React from 'react';
import { Video, Calendar, Clock, AlertTriangle, PlayCircle, Sparkles, Loader2 } from 'lucide-react';
import './footage.css';

export const FootageCard = ({ clip, onPlayRaw, onPlaySmart, isLoading }) => {
  return (
    <div className="footage-card">
      <div className="footage-thumbnail">
        <video src={clip.smartUrl} className="footage-thumb-video" muted playsInline preload="metadata" />
        <div className="footage-thumb-overlay">
          <Video size={24} />
        </div>
        {clip.events > 0 && (
          <div className="footage-event-badge">
            <AlertTriangle size={11} /> {clip.events}
          </div>
        )}
      </div>
      <div className="footage-card-body">
        <p className="footage-title">{clip.title}</p>
        <div className="footage-meta">
          <span><Video size={12} /> {clip.camera}</span>
          <span><Calendar size={12} /> {clip.date}</span>
          <span><Clock size={12} /> {clip.duration}</span>
        </div>
        <div className="footage-card-actions">
          <button className="btn btn-secondary btn-sm footage-action-btn" onClick={onPlayRaw} disabled={isLoading}>
            <PlayCircle size={14} /> Raw Video
          </button>
          <button className="btn btn-primary btn-sm footage-action-btn smart-btn" onClick={onPlaySmart} disabled={isLoading}>
            {isLoading ? (
              <><Loader2 size={14} className="icon-spin" /> Processing...</>
            ) : (
              <><Sparkles size={14} /> Analytics</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
