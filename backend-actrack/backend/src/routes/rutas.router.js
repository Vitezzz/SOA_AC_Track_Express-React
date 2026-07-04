import express from 'express';

import { getRutas, getRutasById, postRutas,
    putRutas, dltRutas
 } from '../controllers/rutas.controller.js';

 import { protect } from '../middlewares/authMiddleware.js';

 const router = express.Router();

 router.get('/', protect,getRutas);
 router.get('/:id', protect,getRutasById);
 router.post('/', protect,postRutas);
 router.put('/:id',protect, putRutas);
 router.delete('/:id', protect,dltRutas);

 export default router;