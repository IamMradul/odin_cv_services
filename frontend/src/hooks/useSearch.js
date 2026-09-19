import { useState, useCallback } from 'react';
import { searchService } from '../services/searchService';

export const useSearch = () => {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('odin_search_history') || '[]');
    } catch { return []; }
  });

  const search = useCallback(async (query, filters = {}) => {
    if (!query?.trim()) return;
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const data = await searchService.search(query, filters);
      setResults(data);
      // Store in history
      setHistory(prev => {
        const updated = [{ query, filters, time: new Date().toISOString() }, ...prev.filter(h => h.query !== query)].slice(0, 10);
        localStorage.setItem('odin_search_history', JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      setError(err.message || 'Search failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setHasSearched(false);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('odin_search_history');
  }, []);

  return { results, isLoading, error, hasSearched, history, search, clearResults, clearHistory };
};
