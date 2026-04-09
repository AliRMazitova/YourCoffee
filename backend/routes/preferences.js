import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getPreferences,
  upsertPreferences,
} from '../controllers/preferencesController.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getPreferences);
router.post('/', upsertPreferences);

export default router;
