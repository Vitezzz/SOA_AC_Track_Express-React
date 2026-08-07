import express from 'express';
import { getReportesCache, postRecalcularReportes } from '../controllers/reportesController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', protect, authorize(2, 5), getReportesCache);
router.post('/recalcular', protect, authorize(2, 5), postRecalcularReportes);

export default router;