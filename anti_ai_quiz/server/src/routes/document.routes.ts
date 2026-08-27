import { Router } from 'express';
import { DocumentController } from '../controllers/DocumentController';
import { authenticateToken } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.use(authenticateToken);

router.post('/upload', upload.single('file'), DocumentController.uploadDocument);
router.get('/', DocumentController.listDocuments);
router.get('/:id', DocumentController.getDocument);
router.delete('/:id', DocumentController.deleteDocument);

export default router;
