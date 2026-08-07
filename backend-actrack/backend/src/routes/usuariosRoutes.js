import express from 'express';
import { getMiPerfil, putMiPerfil, putUsuarioPorId } from '../controllers/usuariosController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/me', protect, getMiPerfil);
router.put('/me', protect, putMiPerfil);
// Solo admin (rol 2) -- editar los datos de identidad de OTRO usuario es
// más sensible que el autoservicio de /me, así que se queda restringido
// hasta que se defina qué puede hacer un supervisor.
router.put('/:id', protect, authorize(2), putUsuarioPorId);

export default router;
