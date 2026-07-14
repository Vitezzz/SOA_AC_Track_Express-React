import express from 'express';
import {
    getOrdenesServicio, getOrdenesServicioById, postOrdenesServicio,
    putOrdenesServicio, dltOrdenesServicio
} from '../controllers/ordenes_servicioController.js';

import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', protect, getOrdenesServicio);
router.get('/:id', protect, getOrdenesServicioById);
router.post('/', protect, authorize(2, 3, 5), postOrdenesServicio);
router.put('/:id', protect, authorize(2, 4, 5), putOrdenesServicio);
router.delete('/:id', protect, authorize(2, 5), dltOrdenesServicio);


export default router;