import express from 'express';
import { getNotificaciones, getNotificacionesById, postNotificaciones,
    putNotificaciones, dltNotificaciones
 } from '../controllers/notificaciones.controller.js';
 import { protect } from '../middlewares/authMiddleware.js';
 import { authorize } from '../middlewares/roleMiddleware.js';

 const router = express.Router();

 router.get('/', protect,getNotificaciones);
 router.get('/:id', protect,getNotificacionesById);
 router.post('/', protect,authorize(2),postNotificaciones);
 router.put('/:id', protect,putNotificaciones);
 router.delete('/:id', protect,authorize(2),dltNotificaciones);

 export default router;