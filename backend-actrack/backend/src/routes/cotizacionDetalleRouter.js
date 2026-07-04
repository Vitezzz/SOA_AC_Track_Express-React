import express from 'express'
import { getCotizacionDetalle, getCotizacionDetalleById,
    postCotizacionDetalleById, putCotizacionDetalleById, dltCotizacionDetalle
 } from '../controllers/cotizacionDetalleController.js'
 import { protect } from '../middlewares/authMiddleware.js';

 const router = express.Router();

 router.get('/', protect,getCotizacionDetalle);
 router.get('/:id', protect,getCotizacionDetalleById);
 router.post('/', protect,postCotizacionDetalleById);
 router.put('/:id', protect,putCotizacionDetalleById);
 router.delete('/:id', protect,dltCotizacionDetalle);

 export default router;