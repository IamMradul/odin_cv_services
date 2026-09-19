import { api } from './api';

export const searchService = {
  async search(query, filters = {}) {
    const params = new URLSearchParams({ q: query, ...filters }).toString();
    return await api.get(`/api/search?${params}`);
  },

  async getSearchHistory() {
    // Stub
    return [];
  },
};
