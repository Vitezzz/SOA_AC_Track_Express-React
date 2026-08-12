import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';

// 15s -- si en ese tiempo no hay ni siquiera un primer fix, algo está mal
// (permiso negado, GPS apagado, sin señal adentro de un edificio) y hay
// que avisar en vez de dejar la pantalla cargando para siempre.
const TIMEOUT_MS = 15000;

// Posición del celular mientras el componente que la use esté montado --
// para "¿ya estoy cerca del cliente?", no para mandar nada a nadie (eso ya
// lo hace useUbicacionEnVivo aparte). Antes, si no había permiso o el GPS
// nunca contestaba, "posicion" se quedaba en null para siempre sin que
// nadie se enterara por qué -- ahora también se expone "error" para que
// una pantalla que SÍ necesita el GPS (como Navegar en la app) pueda
// avisar y no quedarse cargando en el limbo.
export const useUbicacionActual = () => {
  const [posicion, setPosicion] = useState(null);
  const [error, setError] = useState('');
  const watcherRef = useRef(null);

  useEffect(() => {
    let cancelado = false;
    let recibidoAlgunFix = false;

    const timeout = setTimeout(() => {
      if (!cancelado && !recibidoAlgunFix) {
        setError('No se pudo obtener tu ubicación. Revisa que el GPS esté activado y que le diste permiso a la app.');
      }
    }, TIMEOUT_MS);

    const iniciar = async () => {
      try {
        const permiso = await Location.requestForegroundPermissionsAsync();
        if (cancelado) return;
        if (permiso.status !== 'granted') {
          setError('No diste permiso de ubicación -- actívalo desde los ajustes del celular.');
          return;
        }

        watcherRef.current = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 15 },
          (pos) => {
            if (cancelado) return;
            recibidoAlgunFix = true;
            setError('');
            setPosicion({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          }
        );
      } catch (err) {
        if (!cancelado) setError(err.message);
      }
    };

    iniciar();

    return () => {
      cancelado = true;
      clearTimeout(timeout);
      watcherRef.current?.remove();
    };
  }, []);

  return { posicion, error };
};
