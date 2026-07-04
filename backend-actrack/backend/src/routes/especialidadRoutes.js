import express from 'express';
import { getEspecialidad , getEspecialidadById } from '../controllers/especialidadController.js'
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect,getEspecialidad);
router.get('/:id', protect,getEspecialidadById);

export default router;