import express from 'express'
import { getTecnicos, getTecnicosById, postTecnicos,
    putTecnicos, dltTecnicos
 } from '../controllers/tecnicosController.js'
 import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect,getTecnicos);
router.get('/:id', protect,getTecnicosById);
router.post('/', protect,postTecnicos);
router.put('/:id', protect,putTecnicos);
router.delete('/:id', protect,dltTecnicos);

export default router;