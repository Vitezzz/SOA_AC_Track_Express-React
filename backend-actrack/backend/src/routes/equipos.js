import express from 'express';
import { listaEquipos, equiposById, crearEquipo, actualizarEquipo, eliminarEquipo } from '../controllers/equiposController.js';

const router = express.Router();

router.get('/', listaEquipos);
router.get('/:id', equiposById);
router.post('/', crearEquipo);
router.put('/:id', actualizarEquipo);
router.delete('/:id', eliminarEquipo);

export default router;