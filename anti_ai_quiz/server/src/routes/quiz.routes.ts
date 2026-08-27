import { Router } from 'express';
import { QuizController } from '../controllers/QuizController';
import { AttemptController } from '../controllers/AttemptController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

// Quiz Management
router.post('/', QuizController.createQuiz);
router.get('/', QuizController.listQuizzes);
router.get('/:id', QuizController.getQuiz);
router.put('/:id/publish', QuizController.publishQuiz);
router.delete('/:id', QuizController.deleteQuiz);

// Start attempt on quiz
router.post('/:id/start', AttemptController.startAttempt);

// Teacher Question Review actions
router.put('/questions/:questionId', QuizController.updateQuestion);
router.put('/questions/:questionId/status', QuizController.setQuestionStatus);
router.post('/questions/manual', QuizController.createManualQuestion);

export default router;
