import express from 'express';
import { getChecklistEjecucion, postChecklistEjecucion,
    putChecklistEjecucion
 } from '../controllers/checklistEjecucion.js';
 import { protect } from '../middlewares/authMiddleware.js';

 const router = express.Router();

 router.get('/orden/:ordId', protect,getChecklistEjecucion);
 router.post('/', protect,postChecklistEjecucion);
 router.put('/:id', protect,putChecklistEjecucion);

 export default router;