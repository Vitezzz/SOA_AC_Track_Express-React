import express from 'express';
import { getPrioridad, getPrioridadById } from '../controllers/prioridadController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get("/", protect,getPrioridad);
router.get("/:id", protect,getPrioridadById);

export default router;