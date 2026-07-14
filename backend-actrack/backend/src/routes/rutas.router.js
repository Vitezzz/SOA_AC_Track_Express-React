import express from 'express';

import { getRutas, getRutasById, postRutas,
    putRutas, dltRutas
 } from '../controllers/rutas.controller.js';

 import { protect } from '../middlewares/authMiddleware.js';
 import { authorize } from '../middlewares/roleMiddleware.js';

 const router = express.Router();

 router.get('/', protect,getRutas);
 router.get('/:id', protect,getRutasById);
 router.post('/', protect,authorize(2,5),postRutas);
 router.put('/:id',protect, authorize(2,5),putRutas);
 router.delete('/:id', protect,authorize(2),dltRutas);

 export default router;