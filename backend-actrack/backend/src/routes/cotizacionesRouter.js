import express from 'express';
import { getCotizaciones, getCotizacioneById,
    postCotizacione, putCotizaciones, dltCotizaciones
 } from '../controllers/cotizacionesController.js';

 const router = express.Router();

 router.get('/', getCotizaciones);
 router.get('/:id', getCotizacioneById);
 router.post('/', postCotizacione);
 router.put('/:id', putCotizaciones);
 router.delete('/:id', dltCotizaciones);

 export default router;