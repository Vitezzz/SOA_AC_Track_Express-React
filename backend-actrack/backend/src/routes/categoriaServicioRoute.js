import express from 'express';
import { listadoCategoriaServicio, categoriaServicioById, crearCategoriaServicio, putCategoriaServicio, categoriaServicioDelete } from '../controllers/categoria_servicioController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/',protect,listadoCategoriaServicio);
router.get('/:id', protect,categoriaServicioById);
router.post('/', protect,authorize(2),crearCategoriaServicio);
router.put('/:id', protect,authorize(2),putCategoriaServicio);
router.delete('/:id',protect ,authorize(2),categoriaServicioDelete);

export default router;