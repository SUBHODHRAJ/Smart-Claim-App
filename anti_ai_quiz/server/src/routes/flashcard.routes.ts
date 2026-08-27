import { Router } from 'express';
import { FlashcardController } from '../controllers/FlashcardController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/generate', FlashcardController.generateFlashcards);
router.get('/', FlashcardController.listFlashcards);
router.put('/:id', FlashcardController.updateStatus);
router.delete('/:id', FlashcardController.deleteFlashcard);

export default router;
