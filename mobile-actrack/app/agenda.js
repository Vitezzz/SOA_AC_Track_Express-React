import { useState } from 'react';
import { Redirect, useRouter } from 'expo-router';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { useAgendaHoy } from '../src/hooks/useAgendaHoy';

export default function Agenda() {
  const { user, loading: cargandoSesion, logout } = useAuth();
  const router = useRouter();
  const { paradas, cargando, error, recargar } = useAgendaHoy();
  const [refrescando, setRefrescando] = useState(false);

  const onRefresh = async () => {
    setRefrescando(true);
    await recargar();
    setRefrescando(false);
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
        <View>
          <Text style={styles.titulo}>Hola, {user.nombre}</Text>
          <Text style={styles.subtitulo}>Mi Agenda del Día</Text>
        </View>
        <Pressable onPress={logout}>
          <Text style={styles.cerrarSesion}>Cerrar sesión</Text>
        </Pressable>
      </View>

      <View style={styles.navRow}>
        {paradas.length > 0 && (
          <Pressable onPress={() => router.push('/ruta')}>
            <Text style={styles.navLink}>Ver ruta en mapa</Text>
          </Pressable>
        )}
        <Pressable onPress={() => router.push('/estadisticas')}>
          <Text style={styles.navLink}>Mis estadísticas</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/perfil')}>
          <Text style={styles.navLink}>Mi perfil</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {cargando ? (
        <ActivityIndicator style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          data={paradas}
          keyExtractor={(p) => String(p.id)}
          refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={styles.vacio}>No tienes paradas asignadas para hoy.</Text>}
          contentContainerStyle={paradas.length === 0 ? styles.listaVacia : undefined}
          renderItem={({ item }) => (
            <Pressable style={styles.parada} onPress={() => router.push(`/orden/${item.orden.id}`)}>
              <View style={styles.paradaHeader}>
                <Text style={styles.hora}>{item.hora_estimada?.slice(0, 5)}</Text>
                <Text style={styles.folio}>{item.orden.folio}</Text>
              </View>
              <Text style={styles.cliente}>{item.cliente.nombre}</Text>
              <Text style={styles.direccion}>{item.cliente.direccion}</Text>
              <Text style={styles.prioridad}>Prioridad: {item.orden.prioridad}</Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 64, backgroundColor: '#fff' },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  titulo: { fontSize: 22, fontWeight: '700' },
  subtitulo: { color: '#6b7280', marginTop: 2 },
  cerrarSesion: { color: '#dc2626', fontSize: 13 },
  navRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 16 },
  navLink: { color: '#2563eb', fontWeight: '600' },
  error: { color: '#dc2626', marginBottom: 12 },
  vacio: { color: '#6b7280', textAlign: 'center' },
  listaVacia: { flex: 1, justifyContent: 'center' },
  parada: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  paradaHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  hora: { fontWeight: '700', color: '#111827' },
  folio: { color: '#6b7280' },
  cliente: { fontSize: 16, fontWeight: '600' },
  direccion: { color: '#4b5563', marginTop: 2 },
  prioridad: { color: '#4b5563', marginTop: 4, fontSize: 12 },
});
