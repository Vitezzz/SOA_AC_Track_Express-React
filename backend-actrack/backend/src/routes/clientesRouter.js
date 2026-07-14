import express from 'express';  
import { allClientes, clienteById, crearCliente, clienteUpdate, clienteDelete } from '../controllers/clientesController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', protect,authorize(2,4,5),allClientes);
router.get('/:id', protect,authorize(2,4,5),clienteById);
router.post('/', protect,authorize(2,5),crearCliente);
router.put('/:id', protect,authorize(2,5),clienteUpdate);
router.delete('/:id', protect,authorize(2),clienteDelete);

export default router;