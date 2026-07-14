import express from 'express';
import { getChecklistPlantillas, getChecklistPlantillasById,
    postChecklistPlantillas, putChecklistPlantillas, dltChecklistPlantillas
 } from '../controllers/checklistPlantillasController.js';
 import { protect } from '../middlewares/authMiddleware.js';
 import { authorize } from '../middlewares/roleMiddleware.js';

 const router = express.Router();

 router.get('/', protect,getChecklistPlantillas);
 router.get('/:id', protect,getChecklistPlantillasById);
 router.post('/', protect,authorize(2,5),postChecklistPlantillas);
 router.put('/:id', protect,authorize(2,5),putChecklistPlantillas);
 router.delete('/:id', protect,authorize(2,5),dltChecklistPlantillas);

 export default router;