import { useState, useEffect, useCallback, useRef } from 'react';
import { reportService } from '../services/reportService';

export const useReports = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await reportService.getAll();
      setReports(data);
    } catch (err) {
      setError(err.message || 'Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Poll while any report is in transitional state
  useEffect(() => {
    const inProgress = reports.some(r => ['Queued', 'Generating'].includes(r.status));
    if (inProgress && !pollRef.current) {
      pollRef.current = setInterval(() => {
        setReports([...reportService.getReports()]);
      }, 800);
    } else if (!inProgress && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [reports]);

  const createDraft = useCallback(async (data) => {
    const r = await reportService.createDraft(data);
    setReports([r, ...reports]);
    return r;
  }, [reports]);

  const generate = useCallback(async (id) => {
    await reportService.generate(id);
    // Poll will pick up the changes
  }, []);

  return { reports, isLoading, error, refetch: fetchReports, createDraft, generate };
};
