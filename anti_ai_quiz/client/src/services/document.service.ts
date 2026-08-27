import { api } from './api';
import { DocumentItem } from '../types';

export const documentService = {
  async uploadFile(file: File, title?: string, isPublic = false): Promise<{ success: boolean; data: DocumentItem }> {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    formData.append('isPublic', String(isPublic));

    const res = await api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async uploadText(textContent: string, title?: string, isPublic = false): Promise<{ success: boolean; data: DocumentItem }> {
    const res = await api.post('/documents/upload', {
      textContent,
      title: title || 'Pasted Text Notes',
      isPublic,
    });
    return res.data;
  },

  async listDocuments(): Promise<{ success: boolean; data: DocumentItem[] }> {
    const res = await api.get('/documents');
    return res.data;
  },

  async getDocument(id: string): Promise<{ success: boolean; data: DocumentItem }> {
    const res = await api.get(`/documents/${id}`);
    return res.data;
  },

  async deleteDocument(id: string) {
    const res = await api.delete(`/documents/${id}`);
    return res.data;
  },
};
