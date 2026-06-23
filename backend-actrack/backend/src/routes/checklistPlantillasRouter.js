import express from 'express';
import { getChecklistPlantillas, getChecklistPlantillasById,
    postChecklistPlantillas, putChecklistPlantillas, dltChecklistPlantillas
 } from '../controllers/checklistPlantillasController.js';

 const router = express.Router();

 router.get('/', getChecklistPlantillas);
 router.get('/:id', getChecklistPlantillasById);
 router.post('/', postChecklistPlantillas);
 router.put('/:id', putChecklistPlantillas);
 router.delete('/:id', dltChecklistPlantillas);

 export default router;