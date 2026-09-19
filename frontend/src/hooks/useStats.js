import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export const useStats = () => {
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      try {
        const statsData = await api.get('/api/stats');
        setStats(statsData);
      } catch (e) {
        console.warn("Failed to fetch stats (alert-logging may be down)", e);
        setStats(null);
      }
      
      try {
        const healthData = await api.get('/api/health/all');
        setHealth(healthData);
      } catch (e) {
        console.warn("Failed to fetch health data", e);
        setHealth([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, [fetchStats]);

  return { stats, health, isLoading };
};
