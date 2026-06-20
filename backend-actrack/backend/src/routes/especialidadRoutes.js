import express from 'express';
import { getEspecialidad , getEspecialidadById } from '../controllers/especialidadController.js'

const router = express.Router();

router.get('/', getEspecialidad);
router.get('/:id', getEspecialidadById);

export default router;