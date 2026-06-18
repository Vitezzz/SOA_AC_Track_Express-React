import express from 'express';
import { getCategoriaInventario, getCategoriaInventarioById, postCategoriaInventario, putCategoriaInventario, dltCategoriaInventario } from '../controllers/categoria_inventario_controller.js';

const router = express.Router();

router.get('/', getCategoriaInventario);
router.get('/:id', getCategoriaInventarioById);
router.post('/', postCategoriaInventario);
router.put('/:id', putCategoriaInventario);
router.delete('/:id', dltCategoriaInventario);

export default router;
