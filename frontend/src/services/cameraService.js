import { api } from './api';

export const cameraService = {
  async getAll() {
    return await api.get('/api/cameras');
  },

  async getById(id) {
    // Optional endpoint if needed
    const cameras = await api.get('/api/cameras');
    return cameras.find(c => c.id === id) || null;
  },

  async updateStatus(id, status) {
    // Stub
    return { id, status };
  },
};
