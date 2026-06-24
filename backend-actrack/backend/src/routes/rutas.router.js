import express from 'express';

import { getRutas, getRutasById, postRutas,
    putRutas, dltRutas
 } from '../controllers/rutas.controller.js';

 const router = express.Router();

 router.get('/', getRutas);
 router.get('/:id', getRutasById);
 router.post('/', postRutas);
 router.put('/:id', putRutas);
 router.delete('/:id', dltRutas);

 export default router;