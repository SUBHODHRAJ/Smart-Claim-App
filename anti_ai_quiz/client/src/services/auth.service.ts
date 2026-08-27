import { api } from './api';
import { User, UserRole } from '../types';

export const authService = {
  async register(data: { name: string; email: string; password: string; role?: UserRole; classGroup?: string }) {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  async login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },

  async getMe(): Promise<{ success: boolean; data: User }> {
    const res = await api.get('/auth/me');
    return res.data;
  },
};
