import express from 'express'
import { getPagos, getPagosById, postPagos,
    putPagos,dltPagos
 } from '../controllers/pagosController.js'
 
 const router = express.Router();

 router.get('/', getPagos);
 router.get('/:id', getPagosById);
 router.post('/', postPagos);
 router.put('/:id', putPagos);
 router.delete('/:id', dltPagos);

 export default router;