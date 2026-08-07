importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Pega aquí tu objeto de configuración web (el mismo que copiaste de
// Firebase hace rato) -- este archivo vive fuera de tu bundle normal de
// Vite, así que no puede leer tus variables de entorno de .env.
firebase.initializeApp({
    apiKey: "AIzaSyBApo4XXsJVBzVqWFc1T5R8AsUlXiKCKzc",
    authDomain: "actrack-c3d9a.firebaseapp.com",
    projectId: "actrack-c3d9a",
    storageBucket: "actrack-c3d9a.firebasestorage.app",
    messagingSenderId: "318009788903",
    appId: "1:318009788903:web:1c9fc549dc13040998d542",
    measurementId: "G-XEEQSY5WVK"
});

const messaging = firebase.messaging();

// Qué hacer cuando llega una notificación mientras la pestaña está
// cerrada o en segundo plano.
messaging.onBackgroundMessage((payload) => {
    console.log('Notificación recibida en segundo plano:', payload);
    self.registration.showNotification(payload.notification.title, {
        body: payload.notification.body,
        icon: '/icon.png',
    });
});