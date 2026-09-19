import React, { useState } from 'react';
import { FootageCard } from '../components/footage/FootageCard';
import { FootageViewer } from '../components/footage/FootageViewer';
import { Video } from 'lucide-react';
import '../components/footage/footage.css';

const DEMO_CLIPS = [
  { id: '1', title: 'Car Movement', camera: 'Cam 1 (Main Gate)', date: 'Today', duration: '12s', events: 0, rawUrl: '/demo/raw/carmove.mp4', smartUrl: '/demo/smart/out_carmove.mp4' },
  { id: '2', title: 'Crowd Detection', camera: 'Cam 2 (Lobby)', date: 'Today', duration: '15s', events: 2, rawUrl: '/demo/raw/crowd.mp4', smartUrl: '/demo/smart/out_crowd.mp4' },
  { id: '3', title: 'Night Vision', camera: 'Cam 3 (Parking)', date: 'Yesterday', duration: '10s', events: 1, rawUrl: '/demo/raw/night.mp4', smartUrl: '/demo/smart/out_night.mp4' },
  { id: '4', title: 'Night Car', camera: 'Cam 3 (Parking)', date: 'Yesterday', duration: '20s', events: 0, rawUrl: '/demo/raw/nightcar.mp4', smartUrl: '/demo/smart/out_nightcar.mp4' },
  { id: '5', title: 'Vehicle Tracking', camera: 'Cam 1 (Main Gate)', date: 'Today', duration: '25s', events: 3, rawUrl: '/demo/raw/vech.mp4', smartUrl: '/demo/smart/out_vech.mp4' },
  { id: '6', title: 'Weapon Detection', camera: 'Cam 4 (Hallway)', date: 'Today', duration: '8s', events: 1, rawUrl: '/demo/raw/wep.mp4', smartUrl: '/demo/smart/out_wep.mp4' },
];

const FootageDatabase = () => {
  const [selectedClip, setSelectedClip] = useState(null);
  const [viewerUrl, setViewerUrl] = useState('');
  const [viewerTitle, setViewerTitle] = useState('');
  const [loadingClipId, setLoadingClipId] = useState(null);

  const handlePlayRaw = (clip) => {
    setSelectedClip(clip);
    setViewerUrl(clip.rawUrl);
    setViewerTitle(`${clip.title} (Raw)`);
  };

  const handlePlaySmart = (clip) => {
    setLoadingClipId(clip.id);
    setTimeout(() => {
      setLoadingClipId(null);
      setSelectedClip(clip);
      setViewerUrl(clip.smartUrl);
      setViewerTitle(`${clip.title} (Analytics)`);
    }, 5000);
  };

  return (
    <div className="footage-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Footage Database (Demo)</h1>
          <p className="page-subtitle">Browse and review recorded surveillance clips.</p>
        </div>
      </div>

      <div className="footage-grid">
        {DEMO_CLIPS.map(clip => (
          <FootageCard 
            key={clip.id} 
            clip={clip} 
            isLoading={loadingClipId === clip.id}
            onPlayRaw={() => handlePlayRaw(clip)}
            onPlaySmart={() => handlePlaySmart(clip)}
          />
        ))}
      </div>

      <FootageViewer
        clip={selectedClip}
        videoUrl={viewerUrl}
        displayTitle={viewerTitle}
        isOpen={!!selectedClip}
        onClose={() => setSelectedClip(null)}
      />
    </div>
  );
};

export default FootageDatabase;
