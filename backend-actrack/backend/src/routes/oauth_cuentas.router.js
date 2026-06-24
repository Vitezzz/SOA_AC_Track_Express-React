import express from 'express';
import { getOauthCuentas, getOauthCuentasById,
    postOauthCuentas, putOauthCuentas, dltOauthCuentas
 } from '../controllers/oauth_cuentas.js';

 const router = express.Router();

 router.get('/', getOauthCuentas);
 router.get('/:id', getOauthCuentasById);
 router.post('/', postOauthCuentas);
 router.put('/:id', putOauthCuentas);
 router.delete('/:id', dltOauthCuentas);

 export default router;