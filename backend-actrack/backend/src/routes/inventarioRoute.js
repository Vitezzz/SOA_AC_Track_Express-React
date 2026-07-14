import express from 'express';
import { getInventario, getInventarioById, postInventario, putInventario, dltInventario } from '../controllers/inventarioController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', protect,getInventario);
router.get('/:id', protect,getInventarioById);
router.post('/', protect,authorize(2,5),postInventario);
router.put('/:id', protect,authorize(2,5),putInventario);
router.delete('/:id', protect,authorize(2),dltInventario);

export default router;
