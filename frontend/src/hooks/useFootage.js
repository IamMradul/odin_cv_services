import { useState, useEffect, useCallback } from 'react';
import { footageService } from '../services/footageService';

export const useFootage = (filters = {}) => {
  const [clips, setClips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClips = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await footageService.getAll(filters);
      setClips(data);
    } catch (err) {
      setError(err.message || 'Failed to load footage');
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchClips();
  }, [fetchClips]);

  return { clips, isLoading, error, refetch: fetchClips };
};
