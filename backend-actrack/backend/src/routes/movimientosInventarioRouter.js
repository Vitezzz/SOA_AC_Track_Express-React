import express from 'express'
import { getMovimientosInventario, getMovimientosInventarioId,
    postMovimientosInventario, putMovimientosInventario, dltMovimientosInventario
 } from '../controllers/movimientoInventarioController.js'
 import { protect } from '../middlewares/authMiddleware.js';

 const router = express.Router();

 router.get('/',protect,getMovimientosInventario);
 router.get('/:id', protect,getMovimientosInventarioId);
 router.post('/', protect,postMovimientosInventario);
 router.put('/:id', protect,putMovimientosInventario);
 router.delete('/:id', protect,dltMovimientosInventario);

 export default router;
 