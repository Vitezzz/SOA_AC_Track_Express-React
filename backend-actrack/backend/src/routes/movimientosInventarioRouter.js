import express from 'express'
import { getMovimientosInventario, getMovimientosInventarioId,
    postMovimientosInventario, putMovimientosInventario, dltMovimientosInventario
 } from '../controllers/movimientoInventarioController.js'
 import { protect } from '../middlewares/authMiddleware.js';
 import { authorize } from '../middlewares/roleMiddleware.js';

 const router = express.Router();

 router.get('/',protect,getMovimientosInventario);
 router.get('/:id', protect,getMovimientosInventarioId);
 router.post('/', protect,authorize(2,4,5),postMovimientosInventario);
 router.put('/:id', protect,authorize(2),putMovimientosInventario);
 router.delete('/:id', protect,authorize(2),dltMovimientosInventario);

 export default router;
 