import { api } from './api';

export const alertService = {
  async getAll(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return await api.get(`/api/alerts?${params}`);
  },

  async getById(id) {
    return await api.get(`/api/alerts/${id}`);
  },

  async updateStatus(id, newStatus, operator = 'Operator 1') {
    return await api.patch(`/api/alerts/${id}`, { status: newStatus, operator });
  },

  async addNote(id, note, operator = 'Operator 1') {
    return await api.patch(`/api/alerts/${id}`, { note, operator });
  },

  async assign(id, operator) {
    return await api.patch(`/api/alerts/${id}`, { operator });
  },
};
