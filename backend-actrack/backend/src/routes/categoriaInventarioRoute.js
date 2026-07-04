import express from 'express';
import { getCategoriaInventario, getCategoriaInventarioById, postCategoriaInventario, putCategoriaInventario, dltCategoriaInventario } from '../controllers/categoria_inventario_controller.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/',protect ,getCategoriaInventario);
router.get('/:id',protect ,getCategoriaInventarioById);
router.post('/',protect ,postCategoriaInventario);
router.put('/:id', protect,putCategoriaInventario);
router.delete('/:id',protect ,dltCategoriaInventario);

export default router;
