import express from 'express';
import { getInventarioVehiculo, transferirAVehiculo, devolverAlAlmacen } from '../controllers/inventarioVehiculoController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', protect, getInventarioVehiculo);
router.post('/transferir', protect, authorize(2, 5), transferirAVehiculo);
router.post('/devolver', protect, authorize(2, 5), devolverAlAlmacen);

export default router;