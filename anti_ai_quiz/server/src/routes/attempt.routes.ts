import { Router } from 'express';
import { AttemptController } from '../controllers/AttemptController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/:id/submit', AttemptController.submitAttempt);
router.get('/:id', AttemptController.getAttempt);
router.get('/', AttemptController.listUserAttempts);

export default router;
