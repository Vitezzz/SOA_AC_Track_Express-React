import express from 'express';
import { listadoMarcas, marcaById, createMarca,marcaUpdate ,marcaDelete } from '../controllers/marcasController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', protect,listadoMarcas);
router.get('/:id', protect,marcaById);
router.post('/',protect,authorize(2),createMarca);
router.put('/:id', protect,authorize(2),marcaUpdate);
router.delete('/:id', protect,authorize(2),marcaDelete);

export default router;
