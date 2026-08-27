import { Router } from 'express';
import authRoutes from './auth.routes';
import documentRoutes from './document.routes';
import aiRoutes from './ai.routes';
import quizRoutes from './quiz.routes';
import attemptRoutes from './attempt.routes';
import performanceRoutes from './performance.routes';
import flashcardRoutes from './flashcard.routes';
import noteRoutes from './note.routes';
import assignmentRoutes from './assignment.routes';
import gamificationRoutes from './gamification.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/documents', documentRoutes);
router.use('/ai', aiRoutes);
router.use('/quizzes', quizRoutes);
router.use('/attempts', attemptRoutes);
router.use('/performance', performanceRoutes);
router.use('/flashcards', flashcardRoutes);
router.use('/notes', noteRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/gamification', gamificationRoutes);
router.use('/admin', adminRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date(), service: 'AI Quiz Generator Backend' });
});

export default router;
