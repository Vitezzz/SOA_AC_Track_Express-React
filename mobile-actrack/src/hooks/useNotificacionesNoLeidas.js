import { useEffect, useState } from 'react';
import { getMisNotificaciones } from '../api/notificaciones';

// Solo para el badge de la Agenda -- una consulta al entrar/reenfocar la
// pantalla, no un polling en vivo (el push ya avisa de las nuevas).
export const useNotificacionesNoLeidas = (user, apiFetch) => {
  const [noLeidas, setNoLeidas] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelado = false;

    getMisNotificaciones(apiFetch)
      .then((lista) => {
        if (!cancelado) setNoLeidas(lista.filter((n) => !n.leido).length);
      })
      .catch(() => {});

    return () => {
      cancelado = true;
    };
  }, [user, apiFetch]);

  return noLeidas;
};
