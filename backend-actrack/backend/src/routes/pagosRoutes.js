import express from 'express'
import { getPagos, getPagosById, postPagos,
    putPagos,dltPagos
 } from '../controllers/pagosController.js'
 import { protect } from '../middlewares/authMiddleware.js';
 
 const router = express.Router();

 router.get('/', protect,getPagos);
 router.get('/:id', protect,getPagosById);
 router.post('/', protect,postPagos);
 router.put('/:id',protect, putPagos);
 router.delete('/:id', protect,dltPagos);

 export default router;