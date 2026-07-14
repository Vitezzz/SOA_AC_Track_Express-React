import express from 'express'
import { getBitacoraEstados, getBitacoraEstadosById, postBitacoraEstados } from '../controllers/bitacoraEstadosController.js'
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/',protect ,getBitacoraEstados);
router.get('/:id',protect ,getBitacoraEstadosById);
router.post('/',protect ,authorize(2),postBitacoraEstados);

export default router;