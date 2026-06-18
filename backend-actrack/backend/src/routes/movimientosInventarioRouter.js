import express from 'express'
import { getMovimientosInventario, getMovimientosInventarioId,
    postMovimientosInventario, putMovimientosInventario, dltMovimientosInventario
 } from '../controllers/movimientoInventarioController.js'

 const router = express.Router();

 router.get('/', getMovimientosInventario);
 router.get('/:id', getMovimientosInventarioId);
 router.post('/', postMovimientosInventario);
 router.put('/:id', putMovimientosInventario);
 router.delete('/:id', dltMovimientosInventario);

 export default router;
 