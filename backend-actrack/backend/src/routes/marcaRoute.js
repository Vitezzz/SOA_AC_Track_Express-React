import express from 'express';
import { listadoMarcas, marcaById, createMarca,marcaUpdate ,marcaDelete } from '../controllers/marcasController.js';


const router = express.Router();

router.get('/', listadoMarcas);
router.get('/:id', marcaById);
router.post('/',createMarca);
router.put('/:id', marcaUpdate);
router.delete('/:id', marcaDelete);

export default router;
