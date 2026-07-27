import express from 'express'
import { getBitacoraEstados, getBitacoraEstadosById, postBitacoraEstados, getBitacoraPorOrden } from '../controllers/bitacoraEstadosController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/',protect ,getBitacoraEstados);
 router.get('/orden/:ord_id', protect, getBitacoraPorOrden);
router.get('/:id',protect ,getBitacoraEstadosById);
router.post('/',protect ,authorize(2),postBitacoraEstados);

export default router;