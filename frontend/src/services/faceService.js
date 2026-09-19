import { api } from './api';

export const faceService = {
  async getAll(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return await api.get(`/api/faces?${params}`);
  },

  async getById(id) {
    return await api.get(`/api/faces/${id}`);
  },

  async triggerOsint(id) {
    return await api.post(`/api/faces/${id}/osint`, {});
  },

  async getOsintState(id) {
    return await api.get(`/api/faces/${id}/osint`);
  },
};
