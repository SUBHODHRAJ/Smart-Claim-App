import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

const startServer = async () => {
  try {
    await connectDB();

    app.listen(env.PORT, () => {
      console.log(`=============================================`);
      console.log(`🚀 CogniQuiz AI Server running on port ${env.PORT}`);
      console.log(`🌐 Base API URL: http://localhost:${env.PORT}/api`);
      console.log(`🔒 Mode: ${env.NODE_ENV}`);
      console.log(`=============================================`);
    });
  } catch (err) {
    console.error('Failed to initialize server:', err);
    process.exit(1);
  }
};

startServer();
