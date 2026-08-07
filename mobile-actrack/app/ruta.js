import { Redirect, useRouter } from 'expo-router';
import { View, Text, Pressable, ScrollView, Linking, Platform, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useAuth } from '../src/context/AuthContext';
import { useAgendaHoy } from '../src/hooks/useAgendaHoy';
import { ordenEstaCerrada } from '../src/utils/estadosOrden';
import PingsBotones from '../src/components/orden/PingsBotones';

// Primero intentamos el esquema nativo de mapas (abre la app de mapas
// instalada directo, con el destino ya cargado); si no hay ninguna que lo
// atienda, caemos a la URL web de Google Maps. Todo atrapado -- antes esto
// tronaba con una promesa sin manejar si `openURL` fallaba.
const abrirNavegacion = async (lat, lng) => {
  const urlNativa = Platform.select({
    ios: `maps://?daddr=${lat},${lng}`,
    android: `geo:0,0?q=${lat},${lng}`,
  });
  const urlWeb = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  try {
    const puedeAbrirNativa = urlNativa && (await Linking.canOpenURL(urlNativa));
    await Linking.openURL(puedeAbrirNativa ? urlNativa : urlWeb);
  } catch {
    Alert.alert('No se pudo abrir el mapa', 'No encontramos una app de mapas instalada en tu celular.');
  }
};

// Mismo mapa que usa Desktop (Leaflet + tiles de OpenStreetMap, ver
// desktop-actrack/src/renderer/src/pages/Rutas/PlanificarRuta.jsx) -- así
// no dependemos de Google Maps SDK ni de una API key. React Native no
// tiene Leaflet nativo, así que lo montamos en un WebView con el mismo
// HTML/JS que correría en un navegador normal.
const construirHtmlMapa = (paradas) => {
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

  const centro = puntos.length ? [puntos[0].lat, puntos[0].lng] : [17.9895, -92.9475];

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

    if (marcadores.length) {
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
              <View style={{ marginTop: 12 }}>
                <PingsBotones ordenId={siguienteParada.orden.id} estatusOrden={siguienteParada.orden.estatus} />
              </View>
            </View>
          )}

          <WebView style={styles.mapa} originWhitelist={['*']} source={{ html: construirHtmlMapa(paradas) }} />

          <ScrollView style={styles.lista} contentContainerStyle={{ paddingBottom: 24 }}>
            {paradas.map((p) => (
              <View key={p.id} style={styles.parada}>
                <View style={styles.paradaInfo}>
                  <Text style={styles.paradaTitulo}>
                    {p.posicion}. {p.cliente.nombre}
                  </Text>
                  <Text style={styles.paradaDetalle}>
                    {p.orden.folio} · ETA {p.hora_estimada?.slice(0, 5) ?? '—'}
                  </Text>
                  {(!p.cliente.latitud || !p.cliente.longitud) && (
                    <Text style={styles.sinUbicacion}>Sin ubicación guardada</Text>
                  )}
                </View>
                {p.cliente.latitud && p.cliente.longitud && (
                  <Pressable
                    style={styles.navegarBoton}
                    onPress={() => abrirNavegacion(p.cliente.latitud, p.cliente.longitud)}
                  >
                    <Text style={styles.navegarTexto}>Navegar</Text>
                  </Pressable>
                )}
              </View>
            ))}
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
  mapa: { height: '35%', width: '100%' },
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
  navegarBoton: { backgroundColor: '#111827', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
  navegarTexto: { color: '#fff', fontWeight: '600', fontSize: 12 },
});
