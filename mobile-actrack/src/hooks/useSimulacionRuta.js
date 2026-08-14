import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from '../config/env';
import { useAuth } from '../context/AuthContext';
import { getMiTecnico } from '../api/tecnicos';

// Mismo punto de partida que usa Escritorio en Planificar Rutas
// (UBICACION_BASE) -- así el recorrido simulado se ve como si de verdad
// saliera de la oficina.
const UBICACION_BASE = { lat: 17.9895, lng: -92.9475 };

const DURACION_MS = 60000;
const PASO_MS = 1500;

// Solo para pruebas/demos: anima una posición desde la oficina hasta el
// domicilio del cliente y la manda por el mismo canal que usa la
// ubicación en vivo real (useUbicacionEnVivo) -- así Mapa en Vivo de
// Escritorio la ve moverse igual que si fuera un técnico de verdad. La
// posición simulada también se expone aquí para que quien la use (los
// botones de "en camino"/"llegué") calculen la distancia contra ESTA
// posición en vez del GPS real del celular -- así el botón se desbloquea
// solo, de forma coherente con lo que se ve en el mapa.
export const useSimulacionRuta = () => {
  const { user, apiFetch } = useAuth();
  const [activa, setActiva] = useState(false);
  const [posicionSimulada, setPosicionSimulada] = useState(null);
  const socketRef = useRef(null);
  const intervalRef = useRef(null);

  const detener = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    socketRef.current?.disconnect();
    socketRef.current = null;
    setActiva(false);
  }, []);

  const iniciar = useCallback(async (destino) => {
    if (!user || !destino) return;
    detener();

    const tecnico = await getMiTecnico(apiFetch, user.id);
    if (!tecnico) return;

    setActiva(true);
    setPosicionSimulada(UBICACION_BASE);

    const socket = io(API_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    const inicio = Date.now();
    intervalRef.current = setInterval(() => {
      const t = Math.min(1, (Date.now() - inicio) / DURACION_MS);
      const lat = UBICACION_BASE.lat + (destino.lat - UBICACION_BASE.lat) * t;
      const lng = UBICACION_BASE.lng + (destino.lng - UBICACION_BASE.lng) * t;
      setPosicionSimulada({ lat, lng });
      socket.emit('actualizar_ubicacion', { tec_id: tecnico.id, lat, lng });

      if (t >= 1) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        socketRef.current?.disconnect();
        socketRef.current = null;
      }
    }, PASO_MS);
  }, [user, apiFetch, detener]);

  // Si sales de la pantalla a medio recorrido, no dejar el intervalo ni
  // el socket corriendo de fondo.
  useEffect(() => () => detener(), [detener]);

  return { activa, posicionSimulada, iniciar, detener };
};
