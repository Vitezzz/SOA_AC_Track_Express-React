import express from 'express';
import { getInventario, getInventarioById, postInventario, putInventario, dltInventario } from '../controllers/inventarioController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect,getInventario);
router.get('/:id', protect,getInventarioById);
router.post('/', protect,postInventario);
router.put('/:id', protect,putInventario);
router.delete('/:id', protect,dltInventario);

export default router;
