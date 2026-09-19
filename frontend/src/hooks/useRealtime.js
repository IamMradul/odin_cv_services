import { useEffect } from 'react';
import { realtimeService } from '../services/realtimeService';

export const useRealtime = (events = {}) => {
  useEffect(() => {
    realtimeService.connect();

    Object.entries(events).forEach(([event, handler]) => {
      realtimeService.on(event, handler);
    });

    return () => {
      Object.entries(events).forEach(([event, handler]) => {
        realtimeService.off(event, handler);
      });
      realtimeService.disconnect();
    };
  }, []);

  return { isConnected: realtimeService.isConnected };
};
