import express from 'express'
import { getTecnicos, getTecnicosById, postTecnicos,
    putTecnicos, dltTecnicos
 } from '../controllers/tecnicosController.js'

const router = express.Router();

router.get('/', getTecnicos);
router.get('/:id', getTecnicosById);
router.post('/', postTecnicos);
router.put('/:id', putTecnicos);
router.delete('/:id', dltTecnicos);

export default router;