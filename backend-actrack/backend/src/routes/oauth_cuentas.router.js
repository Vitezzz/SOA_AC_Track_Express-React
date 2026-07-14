import express from 'express';
import { getOauthCuentas, getOauthCuentasById,
    postOauthCuentas, putOauthCuentas, dltOauthCuentas
 } from '../controllers/oauth_cuentas.js';
 import { protect } from '../middlewares/authMiddleware.js';
 import { authorize } from '../middlewares/roleMiddleware.js';

 const router = express.Router();

 router.get('/', protect,authorize(2),getOauthCuentas);
 router.get('/:id', protect,authorize(2),getOauthCuentasById);
 router.post('/', protect,authorize(2),postOauthCuentas);
 router.put('/:id', protect,authorize(2),putOauthCuentas);
 router.delete('/:id', protect,authorize(2),dltOauthCuentas);

 export default router;