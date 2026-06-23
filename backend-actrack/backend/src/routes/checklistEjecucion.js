import express from 'express';
import { getChecklistEjecucion, postChecklistEjecucion,
    putChecklistEjecucion
 } from '../controllers/checklistEjecucion.js';

 const router = express.Router();

 router.get('/orden/:ordId', getChecklistEjecucion);
 router.post('/', postChecklistEjecucion);
 router.put('/:id', putChecklistEjecucion);

 export default router;