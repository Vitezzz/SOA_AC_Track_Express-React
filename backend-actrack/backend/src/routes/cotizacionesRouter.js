import express from 'express';
import { getCotizaciones, getCotizacioneById,
    postCotizacione, putCotizaciones, dltCotizaciones
 } from '../controllers/cotizacionesController.js';
 import { protect } from '../middlewares/authMiddleware.js';
 import { authorize } from '../middlewares/roleMiddleware.js';

 const router = express.Router();

 router.get('/', protect,getCotizaciones);
 router.get('/:id', protect,getCotizacioneById);
 router.post('/', protect,authorize(2,4,5),postCotizacione);
 router.put('/:id', protect,putCotizaciones);
 router.delete('/:id', protect,authorize(2),dltCotizaciones);

 export default router;