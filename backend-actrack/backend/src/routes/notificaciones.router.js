import express from 'express';
import { getNotificaciones, getNotificacionesById, postNotificaciones,
    putNotificaciones, dltNotificaciones
 } from '../controllers/notificaciones.controller.js';

 const router = express.Router();

 router.get('/', getNotificaciones);
 router.get('/:id', getNotificacionesById);
 router.post('/', postNotificaciones);
 router.put('/:id', putNotificaciones);
 router.delete('/:id', dltNotificaciones);

 export default router;