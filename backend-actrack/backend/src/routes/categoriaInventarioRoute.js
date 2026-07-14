import express from 'express';
import { getCategoriaInventario, getCategoriaInventarioById, postCategoriaInventario, putCategoriaInventario, dltCategoriaInventario } from '../controllers/categoria_inventario_controller.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/',protect ,getCategoriaInventario);
router.get('/:id',protect ,getCategoriaInventarioById);
router.post('/',protect ,authorize(2),postCategoriaInventario);
router.put('/:id', protect,authorize(2),putCategoriaInventario);
router.delete('/:id',protect ,authorize(2),dltCategoriaInventario);

export default router;
