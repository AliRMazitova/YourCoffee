import { Router } from 'express';
import { getTags } from '../controllers/catalogController.js';

const router = Router();

router.get('/', getTags);

export default router;
