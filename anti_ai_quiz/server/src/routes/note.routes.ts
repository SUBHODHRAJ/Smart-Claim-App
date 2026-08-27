import { Router } from 'express';
import { NoteController } from '../controllers/NoteController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/', NoteController.createNote);
router.get('/', NoteController.listNotes);
router.put('/:id', NoteController.updateNote);
router.delete('/:id', NoteController.deleteNote);

export default router;
