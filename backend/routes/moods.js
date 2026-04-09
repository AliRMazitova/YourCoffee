import { Router } from 'express';
import { getMoods } from '../controllers/catalogController.js';

const router = Router();

router.get('/', getMoods);

export default router;
