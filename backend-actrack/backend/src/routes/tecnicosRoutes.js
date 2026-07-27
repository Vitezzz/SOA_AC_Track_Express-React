import express from 'express'
import {
    getTecnicos, getTecnicosById, postTecnicos,
    putTecnicos, dltTecnicos, getTecnicosTodos
} from '../controllers/tecnicosController.js'
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', protect, getTecnicos);
router.get('/todos', protect, getTecnicosTodos);
router.get('/:id', protect, getTecnicosById);
router.post('/', protect, authorize(2), postTecnicos);
router.put('/:id', protect, authorize(2, 4, 5), putTecnicos);
router.delete('/:id', protect, authorize(2), dltTecnicos);

export default router;