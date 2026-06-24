import express from 'express';
import { getRutaParadasByRutaId, postRutaParadas,
    putRutaParadas, dltRutaParadas
 } from '../controllers/rutaParadas.controller.js';

 const router = express.Router();

 router.get('/ruta/:rut_id', getRutaParadasByRutaId);
 router.post('/', postRutaParadas);
 router.put('/:id', putRutaParadas);
 router.delete('/:id', dltRutaParadas);

 export default router;