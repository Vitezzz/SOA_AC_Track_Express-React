import express from 'express';
import { registrarToken } from '../controllers/pushController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/registrar-token', protect, registrarToken);

export default router;