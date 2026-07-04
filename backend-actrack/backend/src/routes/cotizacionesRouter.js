import express from 'express';
import { getCotizaciones, getCotizacioneById,
    postCotizacione, putCotizaciones, dltCotizaciones
 } from '../controllers/cotizacionesController.js';
 import { protect } from '../middlewares/authMiddleware.js';

 const router = express.Router();

 router.get('/', protect,getCotizaciones);
 router.get('/:id', protect,getCotizacioneById);
 router.post('/', protect,postCotizacione);
 router.put('/:id', protect,putCotizaciones);
 router.delete('/:id', protect,dltCotizaciones);

 export default router;