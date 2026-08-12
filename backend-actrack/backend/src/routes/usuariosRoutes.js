import express from 'express';
import { getMiPerfil, putMiPerfil, putUsuarioPorId, getUsuarios, postUsuario, putActivoUsuario } from '../controllers/usuariosController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/me', protect, getMiPerfil);
router.put('/me', protect, putMiPerfil);
// Gestión de usuarios (Configuración > Usuarios) -- solo admin, es
// provisión/baja de cuentas, no operación del día a día.
router.get('/', protect, authorize(2), getUsuarios);
router.post('/', protect, authorize(2), postUsuario);
router.put('/:id/activo', protect, authorize(2), putActivoUsuario);
// Editar datos de identidad de OTRO usuario -- también admin-only.
router.put('/:id', protect, authorize(2), putUsuarioPorId);

export default router;
