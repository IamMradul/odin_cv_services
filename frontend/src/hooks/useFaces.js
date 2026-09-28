import { useState, useEffect, useCallback } from 'react';
import { HARDCODED_OSINT_DATA } from '../data/osintData';
import { realtimeService } from '../services/realtimeService';

export const useFaces = (filters = {}) => {
  const [faces, setFaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFaces = useCallback(() => {
    setIsLoading(true);
    try {
      const enrichedData = Object.entries(HARDCODED_OSINT_DATA).map(([id, osint]) => ({
        id: id,
        name: osint.name,
        status: osint.statusOverride,
        imageUrl: `/faces/${id}.jpeg`,
        lastSeen: new Date().toISOString(),
        tags: [osint.universityId],
        osintData: osint
      }));

      // Apply local filters if needed
      let filteredData = enrichedData;
      if (filters.query) {
        filteredData = filteredData.filter(f => f.name.toLowerCase().includes(filters.query.toLowerCase()));
      }
      if (filters.status && filters.status !== 'all') {
        filteredData = filteredData.filter(f => f.status.toLowerCase() === filters.status.toLowerCase());
      }

      setFaces(filteredData);
    } catch (err) {
      setError('Failed to load face records');
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchFaces();

    const unsubscribe = realtimeService.on('face_detected', (eventData) => {
      setFaces(prevFaces => 
        prevFaces.map(f => 
          f.id === eventData.person_id 
            ? { ...f, lastSeen: new Date().toISOString() } 
            : f
        )
      );
    });

    return () => {
      unsubscribe();
    };
  }, [fetchFaces]);

  return { faces, isLoading, error, refetch: fetchFaces };
};
