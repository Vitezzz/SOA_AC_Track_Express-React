import express from 'express';
import { getChecklistPlantillas, getChecklistPlantillasById,
    postChecklistPlantillas, putChecklistPlantillas, dltChecklistPlantillas
 } from '../controllers/checklistPlantillasController.js';
 import { protect } from '../middlewares/authMiddleware.js';

 const router = express.Router();

 router.get('/', protect,getChecklistPlantillas);
 router.get('/:id', protect,getChecklistPlantillasById);
 router.post('/', protect,postChecklistPlantillas);
 router.put('/:id', protect,putChecklistPlantillas);
 router.delete('/:id', protect,dltChecklistPlantillas);

 export default router;