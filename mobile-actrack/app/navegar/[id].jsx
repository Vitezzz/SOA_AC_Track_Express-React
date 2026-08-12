import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter, Redirect } from 'expo-router';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useAuth } from '../../src/context/AuthContext';
import { useUbicacionActual } from '../../src/hooks/useUbicacionActual';
import { usePasoActual } from '../../src/hooks/usePasoActual';
import { calcularRutaConPasos } from '../../src/utils/osrmPasos';

// Mismo criterio que ruta.js: Leaflet + tiles de OpenStreetMap dentro de un
// WebView, en vez de un SDK nativo de mapas -- así no se necesita salir de
// Expo Go ni dar de alta una cuenta de Mapbox/Google para tener guiado
// paso a paso adentro de la app.
const construirHtml = (destino) => `
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
    const destino = [${destino.lat}, ${destino.lng}];
    const mapa = L.map('mapa').setView(destino, 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapa);

    L.marker(destino).addTo(mapa).bindPopup('Destino');

    let ruta = null;
    let yo = null;
    let seguirCentrado = true;

    mapa.on('dragstart', () => { seguirCentrado = false; });

    // El RN de afuera llama a estas funciones vía injectJavaScript --
    // así no hay que recargar todo el WebView en cada actualización de
    // posición/ruta, solo se mueve lo que cambió.
    window.dibujarRuta = (coords) => {
      if (ruta) mapa.removeLayer(ruta);
      ruta = L.polyline(coords, { color: '#2563eb', weight: 5 }).addTo(mapa);
      mapa.fitBounds(ruta.getBounds(), { padding: [40, 40] });
    };

    window.moverYo = (lat, lng) => {
      if (yo) {
        yo.setLatLng([lat, lng]);
      } else {
        yo = L.circleMarker([lat, lng], { radius: 8, color: '#fff', weight: 2, fillColor: '#111827', fillOpacity: 1 }).addTo(mapa);
      }
      if (seguirCentrado) mapa.setView([lat, lng], mapa.getZoom());
    };
  </script>
</body>
</html>`;

export default function Navegar() {
  const { id, lat, lng, nombre, folio } = useLocalSearchParams();
  const router = useRouter();
  const { user, loading: cargandoSesion } = useAuth();
  const webviewRef = useRef(null);

  const destino = { lat: Number(lat), lng: Number(lng) };
  const { posicion, error: errorUbicacion } = useUbicacionActual();

  const [ruta, setRuta] = useState(null);
  const [calculando, setCalculando] = useState(true);
  const [error, setError] = useState('');
  const origenInicialRef = useRef(null);

  const { pasoActual, distanciaAlPaso, llegado } = usePasoActual(ruta?.pasos ?? [], posicion);

  // La ruta se calcula UNA vez, con la primera posición GPS que llega --
  // no se recalcula en cada movimiento (eso sería "reruteo en vivo", que
  // no está en la mesa por ahora). Si el técnico se desvía mucho, el
  // guiado se queda apuntando al siguiente punto de la ruta original.
  useEffect(() => {
    if (!posicion || origenInicialRef.current) return;
    origenInicialRef.current = posicion;

    calcularRutaConPasos(posicion, destino)
      .then((r) => {
        setRuta(r);
        webviewRef.current?.injectJavaScript(`window.dibujarRuta(${JSON.stringify(r.coordenadasRuta)}); true;`);
      })
      .catch((err) => setError(err.message))
      .finally(() => setCalculando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posicion]);

  useEffect(() => {
    if (!posicion) return;
    webviewRef.current?.injectJavaScript(`window.moverYo(${posicion.lat}, ${posicion.lng}); true;`);
  }, [posicion]);

  if (cargandoSesion) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) return <Redirect href="/login" />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.volver}>← Atrás</Text>
        </Pressable>
        <Text style={styles.titulo}>{folio}</Text>
      </View>

      {errorUbicacion && !posicion ? (
        <View style={styles.centrado}>
          <Text style={styles.error}>{errorUbicacion}</Text>
          <Pressable onPress={() => router.back()} style={{ marginTop: 12 }}>
            <Text style={styles.volver}>← Volver</Text>
          </Pressable>
        </View>
      ) : !posicion ? (
        <View style={styles.centrado}>
          <ActivityIndicator />
          <Text style={styles.esperandoTexto}>Obteniendo tu ubicación...</Text>
        </View>
      ) : calculando ? (
        <View style={styles.centrado}>
          <ActivityIndicator />
          <Text style={styles.esperandoTexto}>Calculando ruta a {nombre}...</Text>
        </View>
      ) : error ? (
        <View style={styles.centrado}>
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : (
        <>
          <View style={[styles.banner, llegado && styles.bannerLlegado]}>
            {llegado ? (
              <Text style={styles.bannerTexto}>Has llegado a tu destino</Text>
            ) : (
              <>
                <Text style={styles.bannerTexto}>{pasoActual?.instruccion}</Text>
                {distanciaAlPaso != null && (
                  <Text style={styles.bannerDistancia}>
                    {distanciaAlPaso < 1000 ? `${Math.round(distanciaAlPaso)} m` : `${(distanciaAlPaso / 1000).toFixed(1)} km`}
                  </Text>
                )}
              </>
            )}
          </View>

          <WebView
            ref={webviewRef}
            style={styles.mapa}
            originWhitelist={['*']}
            source={{ html: construirHtml(destino) }}
            onLoadEnd={() => {
              if (ruta) webviewRef.current?.injectJavaScript(`window.dibujarRuta(${JSON.stringify(ruta.coordenadasRuta)}); true;`);
              if (posicion) webviewRef.current?.injectJavaScript(`window.moverYo(${posicion.lat}, ${posicion.lng}); true;`);
            }}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 56 },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  esperandoTexto: { color: '#6b7280', fontSize: 13 },
  error: { color: '#dc2626', textAlign: 'center', paddingHorizontal: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  volver: { color: '#2563eb' },
  titulo: { fontWeight: '700', fontSize: 16 },
  banner: { backgroundColor: '#111827', paddingVertical: 16, paddingHorizontal: 20 },
  bannerLlegado: { backgroundColor: '#15803d' },
  bannerTexto: { color: '#fff', fontSize: 16, fontWeight: '600' },
  bannerDistancia: { color: '#d1d5db', fontSize: 13, marginTop: 2 },
  mapa: { flex: 1 },
});
