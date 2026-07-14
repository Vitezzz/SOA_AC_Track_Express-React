import express from 'express';
import { listaEquipos, equiposById, crearEquipo, actualizarEquipo, eliminarEquipo } from '../controllers/equiposController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', protect,listaEquipos);
router.get('/:id', protect,equiposById);
router.post('/', protect,authorize(2,4,5),crearEquipo);
router.put('/:id', protect,authorize(2,4,5),actualizarEquipo);
router.delete('/:id', protect,authorize(2),eliminarEquipo);

export default router;