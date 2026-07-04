import express from 'express'
import { getBitacoraEstados, getBitacoraEstadosById, postBitacoraEstados } from '../controllers/bitacoraEstadosController.js'
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/',protect ,getBitacoraEstados);
router.get('/:id',protect ,getBitacoraEstadosById);
router.post('/',protect ,postBitacoraEstados);

export default router;