import { Router } from 'express';
import { AIController } from '../controllers/AIController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/generate-quiz', AIController.generateQuiz);
router.post('/analyze-performance', AIController.analyzePerformance);
router.post('/generate-study-plan', AIController.generateStudyPlan);
router.get('/active-study-plan', AIController.getActiveStudyPlan);
router.post('/generate-adaptive', AIController.generateAdaptiveQuiz);

export default router;
