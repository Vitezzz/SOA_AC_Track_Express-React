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
  Alert,
} from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { useAgendaHoy, esHoy } from '../src/hooks/useAgendaHoy';
import { aFechaLocal } from '../src/api/rutas';
import { useNotificacionesNoLeidas } from '../src/hooks/useNotificacionesNoLeidas';
import { ordenEstaCerrada } from '../src/utils/estadosOrden';
import Icon from '../src/components/Icon';

// Antes esta pantalla solo sabía mostrar HOY -- si el admin ya armaba la
// ruta de mañana (o de cualquier otro día) con anticipación, el técnico
// no tenía forma de verla hasta que llegara el día. Ahora se puede
// navegar día por día, igual que cualquier agenda.
const sumarDias = (fechaStr, dias) => {
  const [y, m, d] = fechaStr.split('-').map(Number);
  const fecha = new Date(y, m - 1, d + dias);
  return aFechaLocal(fecha);
};

const formatearFechaLarga = (fechaStr) => {
  const [y, m, d] = fechaStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
};

export default function Agenda() {
  const { user, loading: cargandoSesion, apiFetch, logout } = useAuth();
  const router = useRouter();
  const [fecha, setFecha] = useState(aFechaLocal(new Date()));
  const { paradas, cargando, error, recargar } = useAgendaHoy(fecha);
  const noLeidas = useNotificacionesNoLeidas(user, apiFetch);
  const [refrescando, setRefrescando] = useState(false);
  const hoy = esHoy(fecha);

  const confirmarLogout = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: logout },
    ]);
  };

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

  // Las paradas se atienden en orden -- la de posición N+1 se habilita
  // hasta que se cierre la N. Solo aplica viendo HOY: no tiene caso
  // "bloquear" una parada de un día que ni siquiera ha empezado.
  const posicionesAbiertas = paradas.filter((p) => !ordenEstaCerrada(p.orden.estatus)).map((p) => p.posicion);
  const primeraAbiertaPos = hoy && posicionesAbiertas.length ? Math.min(...posicionesAbiertas) : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.titulo}>Hola, {user.nombre}</Text>
          <Text style={styles.subtitulo}>Mi Agenda</Text>
        </View>
        <Pressable onPress={confirmarLogout}>
          <Text style={styles.cerrarSesion}>Cerrar sesión</Text>
        </Pressable>
      </View>

      <View style={styles.selectorDia}>
        <Pressable onPress={() => setFecha((f) => sumarDias(f, -1))} style={styles.flechaDia}>
          <Text style={styles.flechaTexto}>‹</Text>
        </Pressable>
        <Pressable onPress={() => !hoy && setFecha(aFechaLocal(new Date()))} style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.diaTexto}>{hoy ? 'Hoy' : formatearFechaLarga(fecha)}</Text>
          {!hoy && <Text style={styles.volverHoy}>Toca para volver a hoy</Text>}
        </Pressable>
        <Pressable onPress={() => setFecha((f) => sumarDias(f, 1))} style={styles.flechaDia}>
          <Text style={styles.flechaTexto}>›</Text>
        </Pressable>
      </View>

      <View style={styles.navRow}>
        {hoy && paradas.length > 0 && (
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
        <Pressable onPress={() => router.push('/notificaciones')} style={styles.navLinkRow}>
          <Text style={styles.navLink}>Notificaciones</Text>
          {noLeidas > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeTexto}>{noLeidas}</Text>
            </View>
          )}
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
          ListEmptyComponent={
            <Text style={styles.vacio}>
              {hoy ? 'No tienes paradas asignadas para hoy.' : `No tienes paradas para el ${formatearFechaLarga(fecha)}.`}
            </Text>
          }
          contentContainerStyle={paradas.length === 0 ? styles.listaVacia : undefined}
          renderItem={({ item }) => {
            const cerrada = ordenEstaCerrada(item.orden.estatus);
            const bloqueada = !cerrada && primeraAbiertaPos != null && item.posicion > primeraAbiertaPos;
            return (
              <Pressable
                style={[styles.parada, bloqueada && styles.paradaBloqueada]}
                onPress={() => {
                  if (bloqueada) {
                    Alert.alert('Todavía no', 'Termina la parada anterior antes de entrar a esta.');
                    return;
                  }
                  router.push(`/orden/${item.orden.id}`);
                }}
              >
                <View style={styles.paradaHeader}>
                  <Text style={styles.hora}>{item.hora_estimada?.slice(0, 5)}</Text>
                  <Text style={styles.folio}>{item.orden.folio}</Text>
                </View>
                <Text style={[styles.cliente, bloqueada && styles.textoBloqueado]}>{item.cliente.nombre}</Text>
                <Text style={styles.direccion}>{item.cliente.direccion}</Text>
                <Text style={styles.prioridad}>Prioridad: {item.orden.prioridad}</Text>
                {bloqueada && (
                  <View style={styles.avisoBloqueadaRow}>
                    <Icon name="lock" size={11} color="#9ca3af" />
                    <Text style={styles.avisoBloqueada}>Se habilita al terminar la anterior</Text>
                  </View>
                )}
              </Pressable>
            );
          }}
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
  selectorDia: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    marginBottom: 16,
    paddingVertical: 6,
  },
  flechaDia: { paddingHorizontal: 18, paddingVertical: 6 },
  flechaTexto: { fontSize: 22, color: '#111827', fontWeight: '700' },
  diaTexto: { fontSize: 14, fontWeight: '700', color: '#111827', textTransform: 'capitalize' },
  volverHoy: { fontSize: 11, color: '#2563eb', marginTop: 2 },
  navRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 16 },
  navLink: { color: '#2563eb', fontWeight: '600' },
  navLinkRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  badge: { backgroundColor: '#dc2626', borderRadius: 9, minWidth: 18, height: 18, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center' },
  badgeTexto: { color: '#fff', fontSize: 11, fontWeight: '700' },
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
  paradaBloqueada: { backgroundColor: '#f9fafb', opacity: 0.7 },
  textoBloqueado: { color: '#9ca3af' },
  avisoBloqueadaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  avisoBloqueada: { color: '#9ca3af', fontSize: 11, fontStyle: 'italic' },
  paradaHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  hora: { fontWeight: '700', color: '#111827' },
  folio: { color: '#6b7280' },
  cliente: { fontSize: 16, fontWeight: '600' },
  direccion: { color: '#4b5563', marginTop: 2 },
  prioridad: { color: '#4b5563', marginTop: 4, fontSize: 12 },
});
