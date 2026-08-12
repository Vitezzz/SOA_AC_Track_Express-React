import { useEffect, useRef, useState } from 'react';
import { distanciaMetros } from '../utils/distancia';

// Radio para considerar que ya se pasó por el punto de una maniobra y hay
// que avanzar a la siguiente instrucción -- no puede ser muy chico (el GPS
// de celular ya trae su propio margen de error) ni muy grande (avanzaría
// instrucciones antes de tiempo).
const RADIO_AVANCE_METROS = 40;

// Va comparando la posición en vivo del técnico contra los pasos de la
// ruta (ver osrmPasos.js) y regresa cuál instrucción mostrar ahorita.
export const usePasoActual = (pasos, posicion) => {
  const [indice, setIndice] = useState(0);
  const indiceRef = useRef(0);

  useEffect(() => {
    setIndice(0);
    indiceRef.current = 0;
  }, [pasos]);

  useEffect(() => {
    if (!posicion || !pasos.length) return;
    const pasoActual = pasos[indiceRef.current];
    if (!pasoActual) return;

    const distancia = distanciaMetros(posicion.lat, posicion.lng, pasoActual.lat, pasoActual.lng);
    if (distancia <= RADIO_AVANCE_METROS && indiceRef.current < pasos.length - 1) {
      indiceRef.current += 1;
      setIndice(indiceRef.current);
    }
  }, [posicion, pasos]);

  const pasoActual = pasos[indice] ?? null;
  const distanciaAlPaso = posicion && pasoActual
    ? distanciaMetros(posicion.lat, posicion.lng, pasoActual.lat, pasoActual.lng)
    : null;
  const llegado = indice >= pasos.length - 1 && distanciaAlPaso != null && distanciaAlPaso <= RADIO_AVANCE_METROS;

  return { pasoActual, distanciaAlPaso, llegado, indice, total: pasos.length };
};
