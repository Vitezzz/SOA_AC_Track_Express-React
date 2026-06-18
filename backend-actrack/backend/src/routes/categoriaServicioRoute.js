import express from 'express';
import { listadoCategoriaServicio, categoriaServicioById, crearCategoriaServicio, putCategoriaServicio, categoriaServicioDelete } from '../controllers/categoria_servicioController.js';

const router = express.Router();

router.get('/',listadoCategoriaServicio);
router.get('/:id', categoriaServicioById);
router.post('/', crearCategoriaServicio);
router.put('/:id', putCategoriaServicio);
router.delete('/:id', categoriaServicioDelete);

export default router;