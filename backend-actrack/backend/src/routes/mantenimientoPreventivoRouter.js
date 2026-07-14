import express from 'express'
import { getMantenimientoPreventivo, getMantenimientoPreventivoById,
    postMantenimientoPreventivo, putMantenimientoPreventivo, dltMantenimientoPreventivo
 } from '../controllers/mantenimientoPreventivoController.js'
 import { protect } from '../middlewares/authMiddleware.js';
 import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', protect,getMantenimientoPreventivo);
router.get('/:id', protect,getMantenimientoPreventivoById);
router.post('/', protect,authorize(2,5),postMantenimientoPreventivo);
router.put('/:id', protect,authorize(2,5),putMantenimientoPreventivo);
router.delete('/:id', protect,authorize(2),dltMantenimientoPreventivo);

export default router;