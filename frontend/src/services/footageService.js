import { api } from './api';

export const footageService = {
  async getAll(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return await api.get(`/api/footage?${params}`);
  },

  async getById(id) {
    await delay(300);
    return MOCK_CLIPS.find(c => c.id === id) || null;
  },
};
