import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { usePingsOrden } from '../../hooks/usePingsOrden';
import { useUbicacionActual } from '../../hooks/useUbicacionActual';
import { distanciaMetros } from '../../utils/distancia';
import Icon from '../Icon';

// "Llegué" solo se habilita si el GPS confirma que sí está cerca -- antes
// se podía mandar desde cualquier lado, y como ese ping ahora también
// dispara pendiente -> en_proceso en el backend, un llegué falso desincroniza
// el estatus real de la orden. "Voy en camino" no tiene esta restricción,
// no hay nada que verificar todavía.
const RADIO_LLEGADA_METROS = 200;

const PINGS = [
  { estado: 'tecnico_en_camino', etiqueta: 'Voy en camino', confirmado: 'Ya avisaste que vas en camino' },
  { estado: 'tecnico_llego', etiqueta: 'Ya llegué', confirmado: 'Ya avisaste que llegaste' },
];

export default function PingsBotones({ ordenId, estatusOrden, cliente }) {
  const { cargando, error, yaSeMando, mandarPing, enviando } = usePingsOrden(ordenId, estatusOrden);
  const { posicion } = useUbicacionActual();

  if (cargando) return <ActivityIndicator style={{ marginVertical: 8 }} />;

  const tieneUbicacionCliente = cliente?.latitud && cliente?.longitud;
  const distancia = tieneUbicacionCliente && posicion
    ? distanciaMetros(posicion.lat, posicion.lng, Number(cliente.latitud), Number(cliente.longitud))
    : null;
  // Si no se puede verificar (sin GPS, sin ubicación guardada) no se
  // bloquea -- mejor dejar trabajar al técnico que trabarlo por un dato
  // que falta.
  const puedeMarcarLlegada = distancia == null || distancia <= RADIO_LLEGADA_METROS;

  return (
    <View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.row}>
        {PINGS.map((p) => {
          const enviado = yaSeMando(p.estado);
          const esLlegada = p.estado === 'tecnico_llego';
          const bloqueado = esLlegada && !puedeMarcarLlegada;
          return (
            <View key={p.estado} style={styles.slot}>
              {enviado ? (
                <View style={styles.confirmado}>
                  <Icon name="check" size={13} color="#15803d" />
                  <Text style={styles.confirmadoTexto}>{p.confirmado}</Text>
                </View>
              ) : (
                <Pressable
                  style={[styles.boton, bloqueado && styles.botonBloqueado]}
                  onPress={() => mandarPing(p.estado)}
                  disabled={enviando !== null || bloqueado}
                >
                  {enviando === p.estado ? (
                    <ActivityIndicator size="small" color="#111827" />
                  ) : (
                    <Text style={[styles.botonTexto, bloqueado && styles.botonTextoBloqueado]}>{p.etiqueta}</Text>
                  )}
                </Pressable>
              )}
              {esLlegada && bloqueado && !enviado && (
                <Text style={styles.avisoDistancia}>
                  Acércate al domicilio{distancia != null ? ` (a ${Math.round(distancia)} m)` : ''} para poder marcarlo
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  error: { color: '#dc2626', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 10 },
  slot: { flex: 1 },
  boton: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  botonBloqueado: { backgroundColor: '#f3f4f6', borderColor: '#e5e7eb' },
  botonTexto: { color: '#111827', fontWeight: '600' },
  botonTextoBloqueado: { color: '#9ca3af' },
  avisoDistancia: { color: '#b45309', fontSize: 11, marginTop: 4, textAlign: 'center' },
  confirmado: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  confirmadoTexto: { color: '#15803d', fontWeight: '600', fontSize: 12, textAlign: 'center' },
});
