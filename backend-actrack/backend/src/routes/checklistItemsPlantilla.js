import express from 'express'
import { getChecklistItemsPlantilla, getChecklistItemsPlantillaById,
    postChecklistItemsPlantilla, putChecklistItemsPlantillaById, dltChecklistItemsPlantillaById
 } from '../controllers/checklistItemsPlantilla.js'

const router = express.Router();

router.get('/', getChecklistItemsPlantilla);
router.get('/:id',getChecklistItemsPlantillaById);
router.post('/', postChecklistItemsPlantilla);
router.put('/:id',putChecklistItemsPlantillaById);
router.delete('/:id',dltChecklistItemsPlantillaById);

export default router;