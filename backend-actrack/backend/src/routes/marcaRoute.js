import express from 'express';
import { listadoMarcas, marcaById, createMarca,marcaUpdate ,marcaDelete } from '../controllers/marcasController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect,listadoMarcas);
router.get('/:id', protect,marcaById);
router.post('/',protect,createMarca);
router.put('/:id', protect,marcaUpdate);
router.delete('/:id', protect,marcaDelete);

export default router;
