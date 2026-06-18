import express from 'express';
import { getInventario, getInventarioById, postInventario, putInventario, dltInventario } from '../controllers/inventarioController.js';

const router = express.Router();

router.get('/', getInventario);
router.get('/:id', getInventarioById);
router.post('/', postInventario);
router.put('/:id', putInventario);
router.delete('/:id', dltInventario);

export default router;
