import express from 'express';
import { getPrioridad, getPrioridadById } from '../controllers/prioridadController.js';

const router = express.Router();

router.get("/", getPrioridad);
router.get("/:id", getPrioridadById);

export default router;