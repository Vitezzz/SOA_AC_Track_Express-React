import express from 'express';  
import { allClientes, clienteById, crearCliente, clienteUpdate, clienteDelete } from '../controllers/clientesController.js';

const router = express.Router();

router.get('/', allClientes);
router.get('/:id', clienteById);
router.post('/', crearCliente);
router.put('/:id', clienteUpdate);
router.delete('/:id', clienteDelete);

export default router;