import React from 'react';
import { Camera, Clock, TrendingUp, Play } from 'lucide-react';
import './search.css';

export const SearchResultCard = ({ result, onClick }) => {
  return (
    <button className="result-card" onClick={() => onClick(result)}>
      <div className="result-thumbnail">
        <video
          src="/footage.mp4"
          className="result-video"
          muted
          playsInline
          preload="metadata"
        />
        <div className="result-play-icon">
          <Play size={20} fill="white" />
        </div>
        <div className="result-confidence">
          <TrendingUp size={11} /> {result.confidence}%
        </div>
      </div>
      <div className="result-body">
        <p className="result-title">{result.title}</p>
        <div className="result-meta">
          <span><Camera size={12} /> {result.camera}</span>
          <span><Clock size={12} /> {result.timestamp}</span>
        </div>
      </div>
    </button>
  );
};
