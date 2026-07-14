import express from 'express';
import { getRutaParadasByRutaId, postRutaParadas,
    putRutaParadas, dltRutaParadas
 } from '../controllers/rutaParadas.controller.js';
 import { protect } from '../middlewares/authMiddleware.js';
 import { authorize } from '../middlewares/roleMiddleware.js';

 const router = express.Router();

 router.get('/ruta/:rut_id',protect, getRutaParadasByRutaId);
 router.post('/',protect, authorize(2,5),postRutaParadas);
 router.put('/:id', protect,authorize(2,4,5),putRutaParadas);
 router.delete('/:id', protect,authorize(2),dltRutaParadas);

 export default router;