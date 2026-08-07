import { useCallback, useEffect, useState } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { getMisOrdenes } from '../src/api/ordenesServicio';
import { inicioDeSemana, ultimasSemanas, etiquetaSemana } from '../src/utils/semanas';

const SEMANAS_A_MOSTRAR = 6;
const ALTURA_MAXIMA_BARRA = 120;

export default function Estadisticas() {
  const { user, loading: cargandoSesion, apiFetch } = useAuth();
  const router = useRouter();

  const [conteosPorSemana, setConteosPorSemana] = useState([]);
  const [totalCompletadas, setTotalCompletadas] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setError('');
    try {
      const ordenes = await getMisOrdenes(apiFetch);
      const completadas = ordenes.filter((o) => o.estatus === 'completada' && o.fecha_cierre);

      const semanas = ultimasSemanas(SEMANAS_A_MOSTRAR);
      const conteos = semanas.map((inicio) => ({
        inicio,
        etiqueta: etiquetaSemana(inicio),
        total: 0,
      }));

      completadas.forEach((orden) => {
        const inicioOrden = inicioDeSemana(orden.fecha_cierre).getTime();
        const bucket = conteos.find((c) => c.inicio.getTime() === inicioOrden);
        if (bucket) bucket.total += 1;
      });

      setConteosPorSemana(conteos);
      setTotalCompletadas(completadas.length);
    } catch (err) {
      setError(err.message);
    }
  }, [apiFetch]);

  useEffect(() => {
    if (cargandoSesion || !user) return;
    setCargando(true);
    cargar().finally(() => setCargando(false));
  }, [cargandoSesion, user, cargar]);

  if (cargandoSesion) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) return <Redirect href="/login" />;

  const maximo = Math.max(1, ...conteosPorSemana.map((c) => c.total));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.volver}>← Agenda</Text>
        </Pressable>
        <Text style={styles.titulo}>Mis Estadísticas</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {cargando ? (
        <ActivityIndicator style={{ marginTop: 24 }} />
      ) : (
        <>
          <Text style={styles.total}>{totalCompletadas} servicios completados en total</Text>

          <Text style={styles.subtitulo}>Órdenes completadas por semana</Text>
          <View style={styles.grafica}>
            {conteosPorSemana.map((c) => (
              <View key={c.inicio.getTime()} style={styles.columna}>
                <Text style={styles.valorBarra}>{c.total}</Text>
                <View
                  style={[
                    styles.barra,
                    { height: Math.max(4, (c.total / maximo) * ALTURA_MAXIMA_BARRA) },
                  ]}
                />
                <Text style={styles.etiquetaBarra}>{c.etiqueta}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 56, backgroundColor: '#fff' },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  volver: { color: '#2563eb' },
  titulo: { fontWeight: '700', fontSize: 16 },
  error: { color: '#dc2626', marginBottom: 12 },
  total: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 24 },
  subtitulo: { fontSize: 13, fontWeight: '700', color: '#6b7280', marginBottom: 16, textTransform: 'uppercase' },
  grafica: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: ALTURA_MAXIMA_BARRA + 50,
  },
  columna: { alignItems: 'center', flex: 1 },
  valorBarra: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  barra: { width: 20, backgroundColor: '#111827', borderRadius: 4 },
  etiquetaBarra: { fontSize: 11, color: '#6b7280', marginTop: 8 },
});
