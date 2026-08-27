import { api } from './api';
import { Attempt, PerformanceSummary, FlashcardItem, FlashcardStatus, NoteItem, AssignmentItem, LeaderboardEntry, AchievementItem } from '../types';

export const attemptService = {
  async startAttempt(quizId: string): Promise<{ success: boolean; data: Attempt }> {
    const res = await api.post(`/quizzes/${quizId}/start`);
    return res.data;
  },

  async submitAttempt(
    attemptId: string,
    answers: { questionId: string; selectedAnswer: string; timeSpentSeconds?: number }[]
  ): Promise<{ success: boolean; data: Attempt }> {
    const res = await api.post(`/attempts/${attemptId}/submit`, { answers });
    return res.data;
  },

  async getAttempt(attemptId: string): Promise<{ success: boolean; data: Attempt }> {
    const res = await api.get(`/attempts/${attemptId}`);
    return res.data;
  },

  async listUserAttempts(): Promise<{ success: boolean; data: Attempt[] }> {
    const res = await api.get('/attempts');
    return res.data;
  },
};

export const performanceService = {
  async getStudentPerformance(): Promise<{ success: boolean; data: PerformanceSummary }> {
    const res = await api.get('/performance');
    return res.data;
  },

  async getTeacherAnalytics(): Promise<{ success: boolean; data: any }> {
    const res = await api.get('/performance/teacher-analytics');
    return res.data;
  },
};

export const flashcardService = {
  async generate(params: { documentId: string; topic?: string; count?: number }): Promise<{ success: boolean; data: FlashcardItem[] }> {
    const res = await api.post('/flashcards/generate', params);
    return res.data;
  },

  async list(topic?: string): Promise<{ success: boolean; data: FlashcardItem[] }> {
    const res = await api.get(`/flashcards${topic ? `?topic=${topic}` : ''}`);
    return res.data;
  },

  async updateStatus(id: string, status: FlashcardStatus): Promise<{ success: boolean; data: FlashcardItem }> {
    const res = await api.put(`/flashcards/${id}`, { status });
    return res.data;
  },

  async delete(id: string) {
    const res = await api.delete(`/flashcards/${id}`);
    return res.data;
  },
};

export const noteService = {
  async create(data: { title: string; content: string; topic?: string; documentId?: string; tags?: string[] }): Promise<{ success: boolean; data: NoteItem }> {
    const res = await api.post('/notes', data);
    return res.data;
  },

  async list(topic?: string): Promise<{ success: boolean; data: NoteItem[] }> {
    const res = await api.get(`/notes${topic ? `?topic=${topic}` : ''}`);
    return res.data;
  },

  async update(id: string, data: Partial<NoteItem>): Promise<{ success: boolean; data: NoteItem }> {
    const res = await api.put(`/notes/${id}`, data);
    return res.data;
  },

  async delete(id: string) {
    const res = await api.delete(`/notes/${id}`);
    return res.data;
  },
};

export const assignmentService = {
  async create(data: {
    quizId: string;
    targetRole?: 'ALL' | 'CLASS' | 'INDIVIDUAL';
    targetUserIds?: string[];
    classGroup?: string;
    dueDate: string;
    timeLimitMinutes?: number;
    attemptsAllowed?: number;
  }): Promise<{ success: boolean; data: AssignmentItem }> {
    const res = await api.post('/assignments', data);
    return res.data;
  },

  async listForStudent(): Promise<{ success: boolean; data: AssignmentItem[] }> {
    const res = await api.get('/assignments/student');
    return res.data;
  },

  async listForTeacher(): Promise<{ success: boolean; data: AssignmentItem[] }> {
    const res = await api.get('/assignments/teacher');
    return res.data;
  },

  async delete(id: string) {
    const res = await api.delete(`/assignments/${id}`);
    return res.data;
  },
};

export const gamificationService = {
  async getLeaderboard(): Promise<{ success: boolean; data: LeaderboardEntry[] }> {
    const res = await api.get('/gamification/leaderboard');
    return res.data;
  },

  async getMyAchievements(): Promise<{ success: boolean; data: AchievementItem[] }> {
    const res = await api.get('/gamification/achievements');
    return res.data;
  },
};
