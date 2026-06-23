import express from 'express'
import { getMantenimientoPreventivo, getMantenimientoPreventivoById,
    postMantenimientoPreventivo, putMantenimientoPreventivo, dltMantenimientoPreventivo
 } from '../controllers/mantenimientoPreventivoController.js'

const router = express.Router();

router.get('/', getMantenimientoPreventivo);
router.get('/:id', getMantenimientoPreventivoById);
router.post('/', postMantenimientoPreventivo);
router.put('/:id', putMantenimientoPreventivo);
router.delete('/:id', dltMantenimientoPreventivo);

export default router;