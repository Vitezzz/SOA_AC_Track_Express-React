import express from 'express';
import { getNotificaciones, getNotificacionesById, postNotificaciones,
    putNotificaciones, dltNotificaciones
 } from '../controllers/notificaciones.controller.js';
 import { protect } from '../middlewares/authMiddleware.js';

 const router = express.Router();

 router.get('/', protect,getNotificaciones);
 router.get('/:id', protect,getNotificacionesById);
 router.post('/', protect,postNotificaciones);
 router.put('/:id', protect,putNotificaciones);
 router.delete('/:id', protect,dltNotificaciones);

 export default router;