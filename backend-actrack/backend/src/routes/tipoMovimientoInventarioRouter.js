import express from 'express'
import { getTipoMovimientoInventario, getTipoMovimientoInventarioById } from '../controllers/tiposMovimientoInventarioController.js'
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect,getTipoMovimientoInventario);
router.get('/:id', protect,getTipoMovimientoInventarioById);

export default router;