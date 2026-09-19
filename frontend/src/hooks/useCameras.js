import { useState, useEffect, useCallback } from 'react';
import { cameraService } from '../services/cameraService';

export const useCameras = () => {
  const [cameras, setCameras] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCameras = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await cameraService.getAll();
      setCameras(data);
    } catch (err) {
      setError(err.message || 'Failed to load cameras');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCameras();
  }, [fetchCameras]);

  return { cameras, isLoading, error, refetch: fetchCameras };
};
