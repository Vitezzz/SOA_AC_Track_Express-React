import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyBApo4XXsJVBzVqWFc1T5R8AsUlXiKCKzc",
    authDomain: "actrack-c3d9a.firebaseapp.com",
    projectId: "actrack-c3d9a",
    storageBucket: "actrack-c3d9a.firebasestorage.app",
    messagingSenderId: "318009788903",
    appId: "1:318009788903:web:1c9fc549dc13040998d542",
    measurementId: "G-XEEQSY5WVK"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const pedirPermisoYObtenerToken = async () => {
    try {
        const permiso = await Notification.requestPermission();
        if (permiso !== "granted") {
            console.log("El usuario no dio permiso para notificaciones");
            return null;
        }

        const token = await getToken(messaging, {
            vapidKey: "BH5VHf-YTZ37_WsKvvEy2c9pu8QqDXFxqBnHDPXkTtkLczrUg5sytInWWIoSX5C3QIKPiNgkO1maaAU5yp81Syo", // la que generaste en "Configuración web"
        });

        return token;
    } catch (error) {
        console.error("Error al obtener el token de push:", error);
        return null;
    }
};

export const escucharMensajesEnPrimerPlano = (callback) => {
    onMessage(messaging, (payload) => {
        callback(payload);
    });
};