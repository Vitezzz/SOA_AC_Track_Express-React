// Mismo servidor público de OSRM que ya usa desktop-actrack (ver
// desktop-actrack/src/renderer/src/utils/osrm.js) -- pero aquí se usa
// "route", no "trip": las paradas YA vienen en el orden que se planeó
// (o el orden en que se guardaron), no queremos que OSRM las reordene,
// solo que trace la línea que las conecta en ESE orden.
export const calcularPolilineaRuta = async (puntos) => {
  if (puntos.length < 2) return null;

  const coordenadas = puntos.map((p) => `${p.lng},${p.lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coordenadas}?overview=full&geometries=geojson`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('No se pudo calcular la ruta');

  const data = await res.json();
  if (data.code !== 'Ok') throw new Error(data.message || 'OSRM no pudo calcular la ruta');

  const viaje = data.routes[0];
  return {
    coordenadasRuta: viaje.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    distanciaKm: (viaje.distance / 1000).toFixed(1),
    duracionMinutos: Math.round(viaje.duration / 60),
  };
};
