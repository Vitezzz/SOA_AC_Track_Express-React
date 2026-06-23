import express from 'express'
import { getBitacoraEstados, getBitacoraEstadosById, postBitacoraEstados } from '../controllers/bitacoraEstadosController.js'

const router = express.Router();

router.get('/', getBitacoraEstados);
router.get('/:id', getBitacoraEstadosById);
router.post('/', postBitacoraEstados);

export default router;