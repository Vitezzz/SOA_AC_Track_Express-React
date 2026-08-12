// Mismo servidor público de OSRM que ya usa desktop-actrack para calcular
// rutas (desktop-actrack/src/renderer/src/utils/osrm.js) -- pedimos
// "steps=true" para que además de la línea de la ruta regrese cada
// maniobra (da vuelta, sigue derecho, etc.), y así armar un guiado
// paso-a-paso adentro de la app, sin salir a Google/Apple Maps.
const MODIFICADOR_ES = {
  uturn: 'da vuelta en U',
  'sharp right': 'da vuelta cerrada a la derecha',
  right: 'da vuelta a la derecha',
  'slight right': 'mantente ligeramente a la derecha',
  straight: 'sigue derecho',
  'slight left': 'mantente ligeramente a la izquierda',
  left: 'da vuelta a la izquierda',
  'sharp left': 'da vuelta cerrada a la izquierda',
};

const textoManiobra = (maniobra, nombreCalle) => {
  const { type, modifier } = maniobra;
  const calle = nombreCalle ? ` en ${nombreCalle}` : '';

  if (type === 'depart') return 'Iniciando ruta';
  if (type === 'arrive') return 'Has llegado a tu destino';
  if (type === 'roundabout' || type === 'rotary') return `Toma la glorieta${calle}`;
  if (type === 'merge') return `Incorpórate${calle}`;
  if (type === 'fork') return `Mantente en la bifurcación${calle}`;
  if (type === 'end of road') return `${MODIFICADOR_ES[modifier] || 'Continúa'}${calle}`;
  if (type === 'new name' || type === 'continue') return `Continúa${calle}`;

  return `${(MODIFICADOR_ES[modifier] || 'Continúa').replace(/^./, (c) => c.toUpperCase())}${calle}`;
};

export const calcularRutaConPasos = async (origen, destino) => {
  const url = `https://router.project-osrm.org/route/v1/driving/${origen.lng},${origen.lat};${destino.lng},${destino.lat}?overview=full&geometries=geojson&steps=true`;

  // Sin esto, una red mala deja "Calculando ruta..." pegado para siempre --
  // fetch no trae timeout por defecto.
  const controlador = new AbortController();
  const timeout = setTimeout(() => controlador.abort(), 15000);
  let res;
  try {
    res = await fetch(url, { signal: controlador.signal });
  } catch {
    throw new Error('No se pudo conectar con el servidor de rutas. Revisa tu conexión.');
  } finally {
    clearTimeout(timeout);
  }
  if (!res.ok) throw new Error('No se pudo calcular la ruta');

  const data = await res.json();
  if (data.code !== 'Ok') throw new Error(data.message || 'OSRM no pudo calcular la ruta');

  const viaje = data.routes[0];

  const pasos = viaje.legs[0].steps
    .filter((s) => s.distance > 0 || s.maneuver.type === 'arrive')
    .map((s) => ({
      instruccion: textoManiobra(s.maneuver, s.name),
      distanciaMetros: s.distance,
      lat: s.maneuver.location[1],
      lng: s.maneuver.location[0],
    }));

  return {
    coordenadasRuta: viaje.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    distanciaKm: (viaje.distance / 1000).toFixed(1),
    duracionMinutos: Math.round(viaje.duration / 60),
    pasos,
  };
};
