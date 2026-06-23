import express from 'express'
import { getTipoMovimientoInventario, getTipoMovimientoInventarioById } from '../controllers/tiposMovimientoInventarioController.js'

const router = express.Router();

router.get('/', getTipoMovimientoInventario);
router.get('/:id', getTipoMovimientoInventarioById);

export default router;