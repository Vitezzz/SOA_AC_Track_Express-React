import express from 'express';
import { getRutaParadasByRutaId, postRutaParadas,
    putRutaParadas, dltRutaParadas
 } from '../controllers/rutaParadas.controller.js';
 import { protect } from '../middlewares/authMiddleware.js';

 const router = express.Router();

 router.get('/ruta/:rut_id',protect, getRutaParadasByRutaId);
 router.post('/',protect, postRutaParadas);
 router.put('/:id', protect,putRutaParadas);
 router.delete('/:id', protect,dltRutaParadas);

 export default router;