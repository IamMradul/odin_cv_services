import React from 'react';
import { Video, Calendar, Clock, AlertTriangle } from 'lucide-react';
import './footage.css';

export const FootageCard = ({ clip, onClick }) => {
  return (
    <button className="footage-card" onClick={() => onClick(clip)}>
      <div className="footage-thumbnail">
        <video src="/footage.mp4" className="footage-thumb-video" muted playsInline preload="metadata" />
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
      </div>
    </button>
  );
};
