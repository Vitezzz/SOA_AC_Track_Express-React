import { getMessaging } from 'firebase-admin/messaging';
import firebaseApp from '../config/firebase.js';
import { selectTokensByUsuario } from '../models/push_tokens.js';

export const enviarPush = async (usu_id, titulo, cuerpo) => {
    try {
        const tokens = await selectTokensByUsuario(usu_id);
        if (tokens.length === 0) return null;

        const mensaje = {
            notification: { title: titulo, body: cuerpo },
            tokens,
        };

        const respuesta = await getMessaging(firebaseApp).sendEachForMulticast(mensaje);
        console.log(`Push enviado: ${respuesta.successCount} exitosos, ${respuesta.failureCount} fallidos`);
        return respuesta;
    } catch (error) {
        console.error('Error al enviar push:', error.message);
        return null;
    }
}