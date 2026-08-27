import { api } from './api';
import { Question, AIRecommendation, StudyPlan, Quiz, DifficultyLevel } from '../types';

export const aiService = {
  async generateQuiz(params: {
    documentId: string;
    topic?: string;
    numberOfQuestions?: number;
    difficulty?: DifficultyLevel;
  }): Promise<{ success: boolean; data: { document: { id: string; title: string }; questions: Question[]; count: number } }> {
    const res = await api.post('/ai/generate-quiz', params);
    return res.data;
  },

  async analyzePerformance(): Promise<{ success: boolean; data: AIRecommendation }> {
    const res = await api.post('/ai/analyze-performance');
    return res.data;
  },

  async generateStudyPlan(): Promise<{ success: boolean; data: StudyPlan }> {
    const res = await api.post('/ai/generate-study-plan');
    return res.data;
  },

  async getActiveStudyPlan(): Promise<{ success: boolean; data: StudyPlan }> {
    const res = await api.get('/ai/active-study-plan');
    return res.data;
  },

  async generateAdaptiveQuiz(params: {
    topic?: string;
    questionCount?: number;
    documentId?: string;
  }): Promise<{ success: boolean; data: Quiz }> {
    const res = await api.post('/ai/generate-adaptive', params);
    return res.data;
  },
};
