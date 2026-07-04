import express from 'express'
import { getMantenimientoPreventivo, getMantenimientoPreventivoById,
    postMantenimientoPreventivo, putMantenimientoPreventivo, dltMantenimientoPreventivo
 } from '../controllers/mantenimientoPreventivoController.js'
 import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect,getMantenimientoPreventivo);
router.get('/:id', protect,getMantenimientoPreventivoById);
router.post('/', protect,postMantenimientoPreventivo);
router.put('/:id', protect,putMantenimientoPreventivo);
router.delete('/:id', protect,dltMantenimientoPreventivo);

export default router;