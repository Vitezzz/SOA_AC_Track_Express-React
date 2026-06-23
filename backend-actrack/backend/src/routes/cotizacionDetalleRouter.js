import express from 'express'
import { getCotizacionDetalle, getCotizacionDetalleById,
    postCotizacionDetalleById, putCotizacionDetalleById, dltCotizacionDetalle
 } from '../controllers/cotizacionDetalleController.js'

 const router = express.Router();

 router.get('/', getCotizacionDetalle);
 router.get('/:id', getCotizacionDetalleById);
 router.post('/', postCotizacionDetalleById);
 router.put('/:id', putCotizacionDetalleById);
 router.delete('/:id', dltCotizacionDetalle);

 export default router;