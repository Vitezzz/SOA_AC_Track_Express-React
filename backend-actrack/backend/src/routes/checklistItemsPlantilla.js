import express from 'express'
import { getChecklistItemsPlantilla, getChecklistItemsPlantillaById,
    postChecklistItemsPlantilla, putChecklistItemsPlantillaById, dltChecklistItemsPlantillaById
 } from '../controllers/checklistItemsPlantilla.js'
 import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect,getChecklistItemsPlantilla);
router.get('/:id',protect,getChecklistItemsPlantillaById);
router.post('/', protect,postChecklistItemsPlantilla);
router.put('/:id', protect,putChecklistItemsPlantillaById);
router.delete('/:id', protect,dltChecklistItemsPlantillaById);

export default router;