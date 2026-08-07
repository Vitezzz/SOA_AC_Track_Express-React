// Le pedimos a OSRM la ruta óptima entre varios puntos.
// puntos = [{ lat, lng }, { lat, lng }, ...] en el orden que sea -- OSRM
// puede solo calcular la ruta en ESE orden (no reordena), o usar el modo
// "trip" para que también decida el mejor orden de visita.
export const calcularRutaOptima = async (puntos) => {
    // OSRM espera las coordenadas como "lng,lat" (al revés de como
    // normalmente las escribimos nosotros), separadas por punto y coma.
    const coordenadas = puntos.map((p) => `${p.lng},${p.lat}`).join(";");

    // "trip" = además de trazar la ruta, decide el ORDEN óptimo de paradas.
    const url = `https://router.project-osrm.org/trip/v1/driving/${coordenadas}?source=first&roundtrip=false&overview=full&geometries=geojson`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("No se pudo calcular la ruta");

    const data = await res.json();
    if (data.code !== "Ok") throw new Error(data.message || "OSRM no pudo calcular la ruta");

    const viaje = data.trips[0];

    return {
        // GeoJSON con la línea completa de la ruta, lista para dibujar
        coordenadasRuta: viaje.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
        distanciaKm: (viaje.distance / 1000).toFixed(1),
        duracionMinutos: Math.round(viaje.duration / 60),
        // El orden en que OSRM decidió visitar cada parada
        ordenParadas: data.waypoints
            .map((w, i) => ({ indiceOriginal: i, orden: w.waypoint_index }))
            .sort((a, b) => a.orden - b.orden),
        // Duración (segundos) de cada tramo, en el mismo orden que "legs":
        // legs[0] = de la base a la 1a parada visitada, legs[1] = de la 1a
        // a la 2a, etc. Con esto se puede calcular la hora estimada de
        // llegada a cada parada, acumulando desde una hora de salida.
        duracionesTramos: viaje.legs.map((leg) => leg.duration),
    };
};