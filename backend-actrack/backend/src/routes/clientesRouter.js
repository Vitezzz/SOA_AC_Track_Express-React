import express from 'express';  
import { allClientes, clienteById, crearCliente, clienteUpdate, clienteDelete } from '../controllers/clientesController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect,allClientes);
router.get('/:id', protect,clienteById);
router.post('/', protect,crearCliente);
router.put('/:id', protect,clienteUpdate);
router.delete('/:id', protect,clienteDelete);

export default router;