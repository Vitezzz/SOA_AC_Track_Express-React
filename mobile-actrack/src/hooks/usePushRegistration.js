import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Pide permiso y registra el token NATIVO (FCM/APNs) del dispositivo en el
// backend -- ojo, es getDevicePushTokenAsync, no getExpoPushTokenAsync,
// porque el backend manda push con Firebase Admin directo, no con el
// servicio de push de Expo.
//
// En Expo Go (Android, SDK 53+) esto va a fallar siempre -- las push
// remotas requieren un development build ahí. Se captura el error y solo
// se avisa por consola, nunca truena la app.
export const usePushRegistration = (user, apiFetch) => {
  useEffect(() => {
    if (!user) return;
    let cancelado = false;

    const registrar = async () => {
      try {
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Notificaciones AC Track',
            importance: Notifications.AndroidImportance.MAX,
          });
        }

        const permisos = await Notifications.requestPermissionsAsync();
        if (permisos.status !== 'granted' || cancelado) return;

        const { data: token } = await Notifications.getDevicePushTokenAsync();
        if (cancelado) return;

        await apiFetch('/api/push/registrar-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
      } catch (err) {
        console.warn('No se pudo registrar el token de push (esperado en Expo Go en Android):', err.message);
      }
    };

    registrar();
    return () => {
      cancelado = true;
    };
  }, [user, apiFetch]);
};
