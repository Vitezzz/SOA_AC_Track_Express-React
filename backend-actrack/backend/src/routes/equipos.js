import express from 'express';
import { listaEquipos, equiposById, crearEquipo, actualizarEquipo, eliminarEquipo } from '../controllers/equiposController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect,listaEquipos);
router.get('/:id', protect,equiposById);
router.post('/', protect,crearEquipo);
router.put('/:id', protect,actualizarEquipo);
router.delete('/:id', protect,eliminarEquipo);

export default router;