import { useEffect, useRef, useState } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useAuth } from '../src/context/AuthContext';
import { useAgendaHoy } from '../src/hooks/useAgendaHoy';
import { useUbicacionActual } from '../src/hooks/useUbicacionActual';
import { ordenEstaCerrada } from '../src/utils/estadosOrden';
import { abrirNavegacion } from '../src/utils/navegacion';
import { calcularPolilineaRuta } from '../src/utils/osrmPolilinea';
import PingsBotones from '../src/components/orden/PingsBotones';
import Icon from '../src/components/Icon';

const irANavegarEnApp = (router, parada) =>
  router.push({
    pathname: '/navegar/[id]',
    params: {
      id: parada.orden.id,
      lat: parada.cliente.latitud,
      lng: parada.cliente.longitud,
      nombre: parada.cliente.nombre,
      folio: parada.orden.folio,
    },
  });

// Mismo mapa que usa Desktop (Leaflet + tiles de OpenStreetMap, ver
// desktop-actrack/src/renderer/src/pages/Rutas/PlanificarRuta.jsx) -- así
// no dependemos de Google Maps SDK ni de una API key. React Native no
// tiene Leaflet nativo, así que lo montamos en un WebView con el mismo
// HTML/JS que correría en un navegador normal. La línea de la ruta se
// dibuja aparte (window.dibujarRuta), inyectada después de que OSRM
// responde -- así el mapa con los marcadores ya se ve de inmediato, sin
// esperar a la llamada de red.
const construirHtmlMapa = (paradas, posicionInicial) => {
  const puntos = paradas
    .filter((p) => p.cliente.latitud && p.cliente.longitud)
    .map((p) => ({
      lat: Number(p.cliente.latitud),
      lng: Number(p.cliente.longitud),
      posicion: p.posicion,
      nombre: p.cliente.nombre,
      folio: p.orden.folio,
      eta: p.hora_estimada?.slice(0, 5) ?? '—',
    }));

  const centro = posicionInicial || (puntos.length ? [puntos[0].lat, puntos[0].lng] : [17.9895, -92.9475]);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>html, body, #mapa { height: 100%; margin: 0; padding: 0; }</style>
</head>
<body>
  <div id="mapa"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const puntos = ${JSON.stringify(puntos)};
    const mapa = L.map('mapa').setView([${centro[0]}, ${centro[1]}], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapa);

    const marcadores = puntos.map((p) => {
      const m = L.marker([p.lat, p.lng]).addTo(mapa);
      m.bindPopup('<b>' + p.posicion + '. ' + p.nombre + '</b><br/>' + p.folio + ' &middot; ETA ' + p.eta);
      return m;
    });

    let linea = null;
    let yo = null;
    let siguiendo = false;

    // Si el técnico arrastra el mapa a mano, se apaga "seguir" solo --
    // si no, cada actualización de GPS lo jalaría de vuelta y no lo
    // dejaría ver nada más del mapa.
    mapa.on('dragstart', () => { siguiendo = false; });

    window.dibujarRuta = (coords) => {
      if (linea) mapa.removeLayer(linea);
      linea = L.polyline(coords, { color: '#2563eb', weight: 4 }).addTo(mapa);
      mapa.fitBounds(linea.getBounds(), { padding: [30, 30] });
    };

    window.moverYo = (lat, lng) => {
      if (yo) {
        yo.setLatLng([lat, lng]);
      } else {
        yo = L.circleMarker([lat, lng], { radius: 8, color: '#fff', weight: 2, fillColor: '#111827', fillOpacity: 1 }).addTo(mapa);
      }
      if (siguiendo) mapa.setView([lat, lng], mapa.getZoom());
    };

    // Un tap: centra una vez en donde estás ahorita, sin activar
    // seguimiento continuo.
    window.centrarEnMi = () => {
      if (yo) mapa.setView(yo.getLatLng(), Math.max(mapa.getZoom(), 15));
    };

    // Toggle: mientras esté activo, el mapa se vuelve a centrar en cada
    // actualización de GPS -- "seguirme mientras manejo".
    window.setSeguirme = (activo) => {
      siguiendo = activo;
      if (activo && yo) mapa.setView(yo.getLatLng(), Math.max(mapa.getZoom(), 15));
    };

    if (marcadores.length && !linea) {
      mapa.fitBounds(L.featureGroup(marcadores).getBounds(), { padding: [30, 30] });
    }
  </script>
</body>
</html>`;
};

export default function Ruta() {
  const { user, loading: cargandoSesion } = useAuth();
  const router = useRouter();
  const { paradas, cargando, error } = useAgendaHoy();
  const { posicion } = useUbicacionActual();
  const webviewRef = useRef(null);

  const [rutaCalculada, setRutaCalculada] = useState(null);
  const [errorRuta, setErrorRuta] = useState('');
  const [siguiendoMiUbicacion, setSiguiendoMiUbicacion] = useState(false);

  // Paradas que todavía no se cierran -- ya no tiene caso dibujar el
  // camino hacia una que ya se terminó. Si hay GPS, la línea arranca
  // desde donde está el técnico ahorita, no desde la primera parada.
  const paradasPendientes = paradas.filter((p) => !ordenEstaCerrada(p.orden.estatus) && p.cliente.latitud && p.cliente.longitud);

  useEffect(() => {
    const puntos = [
      ...(posicion ? [{ lat: posicion.lat, lng: posicion.lng }] : []),
      ...paradasPendientes.map((p) => ({ lat: Number(p.cliente.latitud), lng: Number(p.cliente.longitud) })),
    ];
    if (puntos.length < 2) return;

    calcularPolilineaRuta(puntos)
      .then((r) => {
        setRutaCalculada(r);
        webviewRef.current?.injectJavaScript(`window.dibujarRuta(${JSON.stringify(r.coordenadasRuta)}); true;`);
      })
      .catch((err) => setErrorRuta(err.message));
    // Solo se recalcula si cambia el set de paradas pendientes -- no en
    // cada tick de GPS, para no estar martillando el servidor público de
    // OSRM cada pocos segundos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paradasPendientes.map((p) => p.id).join(',')]);

  useEffect(() => {
    if (!posicion) return;
    webviewRef.current?.injectJavaScript(`window.moverYo(${posicion.lat}, ${posicion.lng}); true;`);
  }, [posicion]);

  if (cargandoSesion || cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) return <Redirect href="/login" />;

  // La primera parada del día que todavía no se cierra -- a esa vas ahora,
  // así que es la que tiene sentido "avisar" desde aquí.
  const siguienteParada = paradas.find((p) => !ordenEstaCerrada(p.orden.estatus));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.volver}>← Agenda</Text>
        </Pressable>
        <Text style={styles.titulo}>Ruta Optimizada</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {errorRuta ? <Text style={styles.error}>No se pudo trazar la ruta: {errorRuta}</Text> : null}
      {rutaCalculada && (
        <Text style={styles.resumenRuta}>
          {rutaCalculada.distanciaKm} km · {rutaCalculada.duracionMinutos} min aprox.
        </Text>
      )}

      {paradas.length === 0 ? (
        <Text style={styles.vacio}>No tienes paradas asignadas para hoy.</Text>
      ) : (
        <>
          {siguienteParada && (
            <View style={styles.siguienteBox}>
              <Text style={styles.siguienteLabel}>Tu siguiente parada</Text>
              <Pressable onPress={() => router.push(`/orden/${siguienteParada.orden.id}`)}>
                <Text style={styles.siguienteCliente}>{siguienteParada.cliente.nombre}</Text>
                <Text style={styles.siguienteDetalle}>
                  {siguienteParada.orden.folio} · {siguienteParada.cliente.direccion}
                </Text>
              </Pressable>

              {siguienteParada.cliente.latitud && siguienteParada.cliente.longitud && (
                <View style={styles.navegarRow}>
                  <Pressable
                    style={[styles.navegarBoton, styles.navegarBotonPrimario]}
                    onPress={() => irANavegarEnApp(router, siguienteParada)}
                  >
                    <Text style={styles.navegarTextoPrimario}>Navegar en la app</Text>
                  </Pressable>
                  <Pressable
                    style={styles.navegarBoton}
                    onPress={() => abrirNavegacion(siguienteParada.cliente.latitud, siguienteParada.cliente.longitud)}
                  >
                    <Text style={styles.navegarTexto}>Cómo llegar</Text>
                  </Pressable>
                </View>
              )}

              <View style={{ marginTop: 12 }}>
                <PingsBotones ordenId={siguienteParada.orden.id} estatusOrden={siguienteParada.orden.estatus} cliente={siguienteParada.cliente} />
              </View>
            </View>
          )}

          <View style={styles.mapaWrap}>
            <WebView
              ref={webviewRef}
              style={styles.mapa}
              originWhitelist={['*']}
              source={{ html: construirHtmlMapa(paradas, posicion && [posicion.lat, posicion.lng]) }}
              onLoadEnd={() => {
                if (rutaCalculada) webviewRef.current?.injectJavaScript(`window.dibujarRuta(${JSON.stringify(rutaCalculada.coordenadasRuta)}); true;`);
                if (posicion) webviewRef.current?.injectJavaScript(`window.moverYo(${posicion.lat}, ${posicion.lng}); true;`);
                webviewRef.current?.injectJavaScript(`window.setSeguirme(${siguiendoMiUbicacion}); true;`);
              }}
            />

            <View style={styles.mapaBotones}>
              <Pressable
                style={styles.mapaBoton}
                disabled={!posicion}
                onPress={() => webviewRef.current?.injectJavaScript('window.centrarEnMi(); true;')}
              >
                <Icon name="pin" size={18} color="#111827" />
              </Pressable>
              <Pressable
                style={[styles.mapaBoton, siguiendoMiUbicacion && styles.mapaBotonActivo]}
                disabled={!posicion}
                onPress={() => {
                  const nuevoValor = !siguiendoMiUbicacion;
                  setSiguiendoMiUbicacion(nuevoValor);
                  webviewRef.current?.injectJavaScript(`window.setSeguirme(${nuevoValor}); true;`);
                }}
              >
                <Icon name="target" size={18} color={siguiendoMiUbicacion ? '#fff' : '#111827'} />
              </Pressable>
            </View>
          </View>

          <ScrollView style={styles.lista} contentContainerStyle={{ paddingBottom: 24 }}>
            {paradas.map((p) => {
              const cerrada = ordenEstaCerrada(p.orden.estatus);
              const esLaActual = siguienteParada?.id === p.id;
              const tieneUbicacion = p.cliente.latitud && p.cliente.longitud;
              return (
                <View key={p.id} style={styles.parada}>
                  <View style={styles.paradaInfo}>
                    <Text style={styles.paradaTitulo}>
                      {p.posicion}. {p.cliente.nombre}
                    </Text>
                    <Text style={styles.paradaDetalle}>
                      {p.orden.folio} · ETA {p.hora_estimada?.slice(0, 5) ?? '—'}
                    </Text>
                    <Text style={styles.paradaDireccion}>{p.cliente.direccion}</Text>
                    {!tieneUbicacion && <Text style={styles.sinUbicacion}>Sin ubicación guardada</Text>}
                    {/* Se puede ver dónde queda cada parada (el mapa de arriba ya
                        las muestra todas), pero solo se navega a la actual --
                        no tiene caso ponerte a navegar hacia una parada de más
                        tarde mientras la de ahorita sigue sin cerrarse. */}
                    {!cerrada && !esLaActual && <Text style={styles.avisoBloqueada}>Se habilita al llegar tu turno</Text>}
                  </View>
                  {tieneUbicacion && !cerrada && esLaActual && (
                    <Pressable style={styles.navegarBoton} onPress={() => irANavegarEnApp(router, p)}>
                      <Text style={styles.navegarTexto}>Navegar</Text>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 56 },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  volver: { color: '#2563eb' },
  titulo: { fontWeight: '700', fontSize: 16 },
  error: { color: '#dc2626', textAlign: 'center', marginBottom: 8 },
  resumenRuta: { color: '#6b7280', textAlign: 'center', fontSize: 12, marginBottom: 8 },
  vacio: { color: '#6b7280', textAlign: 'center', marginTop: 24 },
  siguienteBox: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 14,
  },
  siguienteLabel: { fontSize: 11, color: '#6b7280', textTransform: 'uppercase', marginBottom: 4 },
  siguienteCliente: { fontSize: 16, fontWeight: '700', color: '#111827' },
  siguienteDetalle: { color: '#4b5563', marginTop: 2, fontSize: 13 },
  navegarRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  navegarBotonPrimario: { backgroundColor: '#111827', borderWidth: 0, flex: 1 },
  navegarTextoPrimario: { color: '#fff', fontWeight: '600', fontSize: 13 },
  paradaDireccion: { color: '#6b7280', fontSize: 11, marginTop: 2 },
  avisoBloqueada: { color: '#9ca3af', fontSize: 11, marginTop: 4, fontStyle: 'italic' },
  mapaWrap: { position: 'relative' },
  mapa: { height: '35%', width: '100%' },
  mapaBotones: { position: 'absolute', right: 12, bottom: 12, gap: 8 },
  mapaBoton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  mapaBotonActivo: { backgroundColor: '#111827' },
  lista: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },
  parada: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 12,
  },
  paradaInfo: { flex: 1 },
  paradaTitulo: { fontWeight: '600', fontSize: 15, color: '#111827' },
  paradaDetalle: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  sinUbicacion: { color: '#b45309', fontSize: 12, marginTop: 2 },
  navegarBoton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#111827', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14, alignItems: 'center' },
  navegarTexto: { color: '#111827', fontWeight: '600', fontSize: 12 },
});
