import { useCallback, useEffect, useState } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { View, Text, Pressable, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { getMisNotificaciones, marcarNotificacionLeida } from '../src/api/notificaciones';

const ETIQUETAS_TIPO = {
  nueva_orden: 'Nueva orden asignada',
  cambio_estatus: 'Cambio en una orden',
};

export default function Notificaciones() {
  const { user, loading: cargandoSesion, apiFetch } = useAuth();
  const router = useRouter();

  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setError('');
    try {
      setNotificaciones(await getMisNotificaciones(apiFetch));
    } catch (err) {
      setError(err.message);
    }
  }, [apiFetch]);

  useEffect(() => {
    if (cargandoSesion || !user) return;
    setCargando(true);
    cargar().finally(() => setCargando(false));
  }, [cargandoSesion, user, cargar]);

  const onRefresh = async () => {
    setRefrescando(true);
    await cargar();
    setRefrescando(false);
  };

  const marcarLeida = async (notificacion) => {
    if (notificacion.leido) return;
    // Optimista -- se ve al toque, y si el PUT falla se recarga la lista real.
    setNotificaciones((prev) =>
      prev.map((n) => (n.id === notificacion.id ? { ...n, leido: true } : n))
    );
    try {
      await marcarNotificacionLeida(apiFetch, notificacion);
    } catch {
      cargar();
    }
  };

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
          <Text style={styles.volver}>← Agenda</Text>
        </Pressable>
        <Text style={styles.titulo}>Notificaciones</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {cargando ? (
        <ActivityIndicator style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          data={notificaciones}
          keyExtractor={(n) => String(n.id)}
          refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={styles.vacio}>No tienes notificaciones.</Text>}
          contentContainerStyle={notificaciones.length === 0 ? styles.listaVacia : { paddingBottom: 24 }}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.notificacion, !item.leido && styles.notificacionNoLeida]}
              onPress={() => marcarLeida(item)}
            >
              {!item.leido && <View style={styles.puntoNoLeido} />}
              <View style={{ flex: 1 }}>
                <Text style={styles.tipo}>{ETIQUETAS_TIPO[item.tipo] ?? item.tipo}</Text>
                <Text style={styles.tituloNotificacion}>{item.titulo}</Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 56, backgroundColor: '#fff' },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  volver: { color: '#2563eb' },
  titulo: { fontWeight: '700', fontSize: 16 },
  error: { color: '#dc2626', marginBottom: 12 },
  vacio: { color: '#6b7280', textAlign: 'center' },
  listaVacia: { flex: 1, justifyContent: 'center' },
  notificacion: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  notificacionNoLeida: { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' },
  puntoNoLeido: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2563eb', marginTop: 5 },
  tipo: { fontSize: 11, color: '#6b7280', textTransform: 'uppercase', marginBottom: 2 },
  tituloNotificacion: { fontSize: 14, color: '#111827', fontWeight: '600' },
});
