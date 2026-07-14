import express from 'express'
import { getPagos, getPagosById, postPagos,
    putPagos,dltPagos
 } from '../controllers/pagosController.js'
 import { protect } from '../middlewares/authMiddleware.js';
 import { authorize } from '../middlewares/roleMiddleware.js';

 const router = express.Router();

 router.get('/', protect,getPagos);
 router.get('/:id', protect,getPagosById);
 router.post('/', protect,authorize(2,5),postPagos);
 router.put('/:id',protect, authorize(2,5),putPagos);
 router.delete('/:id', protect,authorize(2),dltPagos);

 export default router;