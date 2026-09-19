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

  const isDrawing = useRef(false);

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
        if (isDrawing.current) return; // Drop frame if viewer is busy to prevent accumulated lag
        isDrawing.current = true;
        
        try {
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
        } catch (err) {
          console.error('Error drawing frame', err);
        } finally {
          isDrawing.current = false;
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
  
  // Scale font size dynamically based on the resolution (e.g. 1080p -> ~30px)
  const fontSize = Math.max(16, Math.round(height / 35));
  const boxHeight = fontSize + 10;
  
  ctx.lineWidth = Math.max(2, Math.round(width / 400));
  ctx.font = `bold ${fontSize}px sans-serif`;

  const drawBox = (box, color, label) => {
    if (!box || box.length !== 4) return;
    
    const [x1, y1, x2, y2] = box;
    const x = x1;
    const y = y1;
    const w = x2 - x1;
    const h = y2 - y1;

    ctx.strokeStyle = color;
    ctx.strokeRect(x, y, w, h);
    
    // Draw label above the box (or inside if too close to the top)
    const labelY = y - boxHeight < 0 ? y : y - boxHeight;
    const textY = y - boxHeight < 0 ? y + fontSize + 2 : y - 6;

    ctx.fillStyle = color;
    ctx.fillRect(x, labelY, ctx.measureText(label).width + 12, boxHeight);
    
    // Use black text on bright backgrounds for better contrast
    ctx.fillStyle = (color === '#ffffff' || color === '#ffff00' || color === '#00ff00') ? '#000' : '#fff';
    ctx.fillText(label, x + 6, textY);
  };

  if (dets.human?.ok) {
    dets.human.detections.forEach(d => drawBox(d.box, '#00ff00', d.label || 'Human'));
  }
  if (dets.vehicle?.ok) {
    dets.vehicle.detections.forEach(d => drawBox(d.box, '#0088ff', d.label || 'Vehicle'));
  }
  if (dets.face?.ok) {
    dets.face.detections.forEach(d => {
      const statusStr = (d.status || d.label || '').toLowerCase();
      let color = '#ffffff'; // white for undefined
      if (statusStr.includes('safe')) {
        color = '#00ff00'; // green for safe
      } else if (statusStr.includes('threat')) {
        color = '#ff0000'; // red for threat
      }
      drawBox(d.box, color, d.label || 'Face');
    });
  }
  if (dets.suspicious?.ok) {
    dets.suspicious.detections.forEach(d => {
      const color = d.severity === 'CRITICAL' ? '#ff0000'
                  : d.severity === 'HIGH' ? '#ff8800'
                  : '#ffff00';
      const label = d.weapon_class
        ? `${d.alert_type} [${d.weapon_class}] ${(d.confidence * 100).toFixed(0)}%`
        : `${d.alert_type} ${(d.confidence * 100).toFixed(0)}%`;
      drawBox(d.box, color, label);
    });
  }
}
