import express from 'express'
import { getCotizacionDetalle, getCotizacionDetalleById,
    postCotizacionDetalleById, putCotizacionDetalleById, dltCotizacionDetalle
 } from '../controllers/cotizacionDetalleController.js'
 import { protect } from '../middlewares/authMiddleware.js';
 import { authorize } from '../middlewares/roleMiddleware.js';

 const router = express.Router();

 router.get('/', protect,getCotizacionDetalle);
 router.get('/:id', protect,getCotizacionDetalleById);
 router.post('/', protect,authorize(2,4,5),postCotizacionDetalleById);
 router.put('/:id', protect,authorize(2,4,5),putCotizacionDetalleById);
 router.delete('/:id', protect,authorize(2),dltCotizacionDetalle);

 export default router;