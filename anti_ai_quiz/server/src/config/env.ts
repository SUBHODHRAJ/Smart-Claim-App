import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: parseInt(process.env.PORT || '5001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_quiz_generator',
  JWT_SECRET: process.env.JWT_SECRET || 'super_secret_jwt_key_ai_quiz_gen_2026_secure',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  AI_API_KEY: process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || '',
  AI_PROVIDER: (process.env.AI_PROVIDER || 'gemini').toLowerCase(),
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '15', 10),
  WEAK_TOPIC_THRESHOLD_PERCENT: parseInt(process.env.WEAK_TOPIC_THRESHOLD_PERCENT || '65', 10),
};
