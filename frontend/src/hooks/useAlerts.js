import { useState, useEffect, useCallback } from 'react';
import { alertService } from '../services/alertService';

export const useAlerts = (filters = {}) => {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAlerts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await alertService.getAll(filters);
      setAlerts(data);
    } catch (err) {
      setError(err.message || 'Failed to load alerts');
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const updateStatus = useCallback(async (id, status) => {
    await alertService.updateStatus(id, status);
    await fetchAlerts();
  }, [fetchAlerts]);

  const addNote = useCallback(async (id, note) => {
    await alertService.addNote(id, note);
    await fetchAlerts();
  }, [fetchAlerts]);

  const assign = useCallback(async (id, operator) => {
    await alertService.assign(id, operator);
    await fetchAlerts();
  }, [fetchAlerts]);

  return { alerts, isLoading, error, refetch: fetchAlerts, updateStatus, addNote, assign };
};
