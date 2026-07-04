import express from 'express';
import { listadoCategoriaServicio, categoriaServicioById, crearCategoriaServicio, putCategoriaServicio, categoriaServicioDelete } from '../controllers/categoria_servicioController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/',protect,listadoCategoriaServicio);
router.get('/:id', protect,categoriaServicioById);
router.post('/', protect,crearCategoriaServicio);
router.put('/:id', protect,putCategoriaServicio);
router.delete('/:id',protect ,categoriaServicioDelete);

export default router;