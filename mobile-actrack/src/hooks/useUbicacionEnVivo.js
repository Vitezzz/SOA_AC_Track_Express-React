import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { io } from 'socket.io-client';
import { API_URL } from '../config/env';
import { getMiTecnico } from '../api/tecnicos';

// Manda la posición del técnico por WebSocket cada vez que se mueve --
// el mapa en vivo de Desktop escucha "ubicacion_tecnico" (ver
// backend-actrack/backend/src/socket.js).
export const useUbicacionEnVivo = (user, apiFetch) => {
  const socketRef = useRef(null);
  const watcherRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    let cancelado = false;

    const iniciar = async () => {
      try {
        const tecnico = await getMiTecnico(apiFetch, user.id);
        if (!tecnico || cancelado) return;

        const permiso = await Location.requestForegroundPermissionsAsync();
        if (permiso.status !== 'granted' || cancelado) return;

        const socket = io(API_URL, { transports: ['websocket'] });
        socketRef.current = socket;

        watcherRef.current = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, timeInterval: 15000, distanceInterval: 50 },
          (posicion) => {
            socket.emit('actualizar_ubicacion', {
              tec_id: tecnico.id,
              lat: posicion.coords.latitude,
              lng: posicion.coords.longitude,
            });
          }
        );
      } catch (err) {
        console.warn('No se pudo iniciar la ubicación en vivo:', err.message);
      }
    };

    iniciar();

    return () => {
      cancelado = true;
      watcherRef.current?.remove();
      socketRef.current?.disconnect();
    };
  }, [user, apiFetch]);
};
