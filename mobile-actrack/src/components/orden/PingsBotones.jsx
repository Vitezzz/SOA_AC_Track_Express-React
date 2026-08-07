import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { usePingsOrden } from '../../hooks/usePingsOrden';

const PINGS = [
  { estado: 'tecnico_en_camino', etiqueta: 'Voy en camino', confirmado: 'Ya avisaste que vas en camino' },
  { estado: 'tecnico_llego', etiqueta: 'Ya llegué', confirmado: 'Ya avisaste que llegaste' },
];

export default function PingsBotones({ ordenId, estatusOrden }) {
  const { cargando, error, yaSeMando, mandarPing, enviando } = usePingsOrden(ordenId, estatusOrden);

  if (cargando) return <ActivityIndicator style={{ marginVertical: 8 }} />;

  return (
    <View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.row}>
        {PINGS.map((p) => {
          const enviado = yaSeMando(p.estado);
          return (
            <View key={p.estado} style={styles.slot}>
              {enviado ? (
                <View style={styles.confirmado}>
                  <Text style={styles.confirmadoTexto}>✓ {p.confirmado}</Text>
                </View>
              ) : (
                <Pressable style={styles.boton} onPress={() => mandarPing(p.estado)} disabled={enviando !== null}>
                  {enviando === p.estado ? (
                    <ActivityIndicator size="small" color="#111827" />
                  ) : (
                    <Text style={styles.botonTexto}>{p.etiqueta}</Text>
                  )}
                </Pressable>
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
  botonTexto: { color: '#111827', fontWeight: '600' },
  confirmado: {
    borderWidth: 1,
    borderColor: '#bbf7d0',
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  confirmadoTexto: { color: '#15803d', fontWeight: '600', fontSize: 12, textAlign: 'center' },
});
