import express from 'express';
import { getOauthCuentas, getOauthCuentasById,
    postOauthCuentas, putOauthCuentas, dltOauthCuentas
 } from '../controllers/oauth_cuentas.js';
 import { protect } from '../middlewares/authMiddleware.js';

 const router = express.Router();

 router.get('/', protect,getOauthCuentas);
 router.get('/:id', protect,getOauthCuentasById);
 router.post('/', protect,postOauthCuentas);
 router.put('/:id', protect,putOauthCuentas);
 router.delete('/:id', protect,dltOauthCuentas);

 export default router;