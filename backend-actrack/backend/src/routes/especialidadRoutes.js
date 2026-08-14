import express from 'express';
import { getEspecialidad, getEspecialidadById, crearEspecialidad, putEspecialidad, especialidadDelete } from '../controllers/especialidadController.js'
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', protect,getEspecialidad);
router.get('/:id', protect,getEspecialidadById);
router.post('/', protect, authorize(2), crearEspecialidad);
router.put('/:id', protect, authorize(2), putEspecialidad);
router.delete('/:id', protect, authorize(2), especialidadDelete);

export default router;