import { useState, useEffect, useCallback } from 'react';
import { faceService } from '../services/faceService';

export const useFaces = (filters = {}) => {
  const [faces, setFaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFaces = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await faceService.getAll(filters);
      setFaces(data);
    } catch (err) {
      setError(err.message || 'Failed to load face records');
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchFaces();
  }, [fetchFaces]);

  return { faces, isLoading, error, refetch: fetchFaces };
};
