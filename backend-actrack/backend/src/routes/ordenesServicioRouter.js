import express from 'express';
import { getOrdenesServicio, getOrdenesServicioById, postOrdenesServicio,
    putOrdenesServicio, dltOrdenesServicio
 } from '../controllers/ordenes_servicioController.js';

 import { protect } from "../middlewares/authMiddleware.js";

 const router = express.Router();

 router.get('/', protect ,getOrdenesServicio);
 router.get('/:id',protect ,getOrdenesServicioById);
 router.post('/',protect ,postOrdenesServicio);
 router.put('/:id',protect ,putOrdenesServicio);
 router.delete('/:id',protect ,dltOrdenesServicio);

 export default router;