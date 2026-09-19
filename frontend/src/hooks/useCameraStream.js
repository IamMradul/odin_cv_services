import { useEffect, useRef, useState } from 'react';

const CAMERA_WS_URL = import.meta.env.VITE_CAMERA_WS_URL || 'ws://localhost:8000';

export const useCameraStream = (sourceId) => {
  const canvasRef = useRef(null);
  const [status, setStatus] = useState('connecting'); // connecting, streaming, offline
  const [detections, setDetections] = useState({});
  const detectionsRef = useRef(detections);
  const [fps, setFps] = useState(0);
  const framesCount = useRef(0);
  const fpsInterval = useRef(null);

  // Keep ref in sync
  useEffect(() => {
    detectionsRef.current = detections;
  }, [detections]);

  // Track FPS
  useEffect(() => {
    fpsInterval.current = setInterval(() => {
      setFps(framesCount.current);
      framesCount.current = 0;
    }, 1000);
    return () => clearInterval(fpsInterval.current);
  }, []);

  useEffect(() => {
    if (!sourceId) return;

    const url = `${CAMERA_WS_URL}/ws/view/${sourceId}`;
    console.log('Connecting to camera WS:', url);
    let ws = new WebSocket(url);
    setStatus('connecting');

    ws.onopen = () => {
      setStatus('streaming');
    };

    ws.onmessage = async (e) => {
      if (typeof e.data === 'string') {
        try {
          const data = JSON.parse(e.data);
          // If the gateway/camera server sends the detection map directly
          if (data.human || data.vehicle || data.face || data.suspicious) {
            setDetections(data);
          } else if (data.type === 'detections') {
            setDetections(data.detections);
          }
        } catch (err) {
          console.error('Error parsing detection JSON', err);
        }
      } else {
        // Blob / ArrayBuffer (JPEG frame)
        framesCount.current++;
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          const blob = e.data;
          const imageBitmap = await createImageBitmap(blob);
          
          if (canvas.width !== imageBitmap.width || canvas.height !== imageBitmap.height) {
            canvas.width = imageBitmap.width;
            canvas.height = imageBitmap.height;
          }
          
          // Draw the image onto the canvas, stretching to fit
          ctx.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);
          
          // Draw detections using the latest ref
          drawOverlays(ctx, detectionsRef.current, canvas.width, canvas.height);
        }
      }
    };

    ws.onclose = () => {
      setStatus('offline');
    };

    ws.onerror = () => {
      setStatus('offline');
    };

    return () => {
      ws.close();
      if (fpsInterval.current) clearInterval(fpsInterval.current);
    };
  }, [sourceId]);

  return { canvasRef, status, detections, fps };
};

function drawOverlays(ctx, dets, width, height) {
  if (!dets) return;
  
  ctx.lineWidth = 2;
  ctx.font = '14px sans-serif';

  const drawBox = (box, color, label) => {
    if (!box || box.length !== 4) return;
    
    const [x1, y1, x2, y2] = box;
    const x = x1;
    const y = y1;
    const w = x2 - x1;
    const h = y2 - y1;

    ctx.strokeStyle = color;
    ctx.strokeRect(x, y, w, h);
    
    ctx.fillStyle = color;
    ctx.fillRect(x, y - 20, ctx.measureText(label).width + 10, 20);
    ctx.fillStyle = '#fff';
    ctx.fillText(label, x + 5, y - 5);
  };

  if (dets.human?.ok) {
    dets.human.detections.forEach(d => drawBox(d.box, '#00ff00', d.label || 'Human'));
  }
  if (dets.vehicle?.ok) {
    dets.vehicle.detections.forEach(d => drawBox(d.box, '#0088ff', d.label || 'Vehicle'));
  }
  if (dets.face?.ok) {
    dets.face.detections.forEach(d => drawBox(d.box, '#ff00ff', d.label || 'Face'));
  }
  if (dets.suspicious?.ok) {
    dets.suspicious.detections.forEach(d => drawBox(d.box, '#ff0000', d.alert_type || 'Suspicious'));
  }
}
