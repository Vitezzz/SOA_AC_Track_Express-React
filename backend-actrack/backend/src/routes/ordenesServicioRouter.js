import express from 'express';
import { getOrdenesServicio, getOrdenesServicioById, postOrdenesServicio,
    putOrdenesServicio, dltOrdenesServicio
 } from '../controllers/ordenes_servicioController.js';

 const router = express.Router();

 router.get('/', getOrdenesServicio);
 router.get('/:id', getOrdenesServicioById);
 router.post('/', postOrdenesServicio);
 router.put('/:id', putOrdenesServicio);
 router.delete('/:id', dltOrdenesServicio);

 export default router;