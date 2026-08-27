import { api } from './api';
import { Quiz, Question, ValidationStatus, DifficultyLevel } from '../types';

export const quizService = {
  async createQuiz(data: {
    title: string;
    description?: string;
    documentId?: string;
    questionIds: string[];
    difficulty?: DifficultyLevel;
    timeLimitMinutes?: number;
    isPublished?: boolean;
    topic?: string;
  }): Promise<{ success: boolean; data: Quiz }> {
    const res = await api.post('/quizzes', data);
    return res.data;
  },

  async listQuizzes(): Promise<{ success: boolean; data: Quiz[] }> {
    const res = await api.get('/quizzes');
    return res.data;
  },

  async getQuiz(id: string, taking = false): Promise<{ success: boolean; data: Quiz }> {
    const res = await api.get(`/quizzes/${id}${taking ? '?taking=true' : ''}`);
    return res.data;
  },

  async publishQuiz(id: string, isPublished: boolean): Promise<{ success: boolean; data: Quiz }> {
    const res = await api.put(`/quizzes/${id}/publish`, { isPublished });
    return res.data;
  },

  async deleteQuiz(id: string) {
    const res = await api.delete(`/quizzes/${id}`);
    return res.data;
  },

  async updateQuestion(
    questionId: string,
    data: Partial<Question>
  ): Promise<{ success: boolean; data: Question }> {
    const res = await api.put(`/quizzes/questions/${questionId}`, data);
    return res.data;
  },

  async setQuestionStatus(
    questionId: string,
    status: ValidationStatus
  ): Promise<{ success: boolean; data: Question }> {
    const res = await api.put(`/quizzes/questions/${questionId}/status`, { status });
    return res.data;
  },

  async createManualQuestion(data: Partial<Question>): Promise<{ success: boolean; data: Question }> {
    const res = await api.post('/quizzes/questions/manual', data);
    return res.data;
  },
};
