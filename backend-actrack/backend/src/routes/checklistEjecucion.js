import express from 'express';
import { getChecklistEjecucion, postChecklistEjecucion,
    putChecklistEjecucion
 } from '../controllers/checklistEjecucion.js';
 import { protect } from '../middlewares/authMiddleware.js';
 import { authorize } from '../middlewares/roleMiddleware.js';

 const router = express.Router();

 router.get('/orden/:ordId', protect,getChecklistEjecucion);
 router.post('/', protect,authorize(2,4,5),postChecklistEjecucion);
 router.put('/:id', protect,authorize(2,4,5),putChecklistEjecucion);

 export default router;