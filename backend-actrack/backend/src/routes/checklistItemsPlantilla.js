import express from 'express'
import { getChecklistItemsPlantilla, getChecklistItemsPlantillaById,
    postChecklistItemsPlantilla, putChecklistItemsPlantillaById, dltChecklistItemsPlantillaById
 } from '../controllers/checklistItemsPlantilla.js'
 import { protect } from '../middlewares/authMiddleware.js';
 import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', protect,getChecklistItemsPlantilla);
router.get('/:id',protect,getChecklistItemsPlantillaById);
router.post('/', protect,authorize(2,5),postChecklistItemsPlantilla);
router.put('/:id', protect,authorize(2,5),putChecklistItemsPlantillaById);
router.delete('/:id', protect,authorize(2,5),dltChecklistItemsPlantillaById);

export default router;