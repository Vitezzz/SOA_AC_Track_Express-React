import { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import {
  getInventarioVehiculo,
  getCatalogoInventario,
  getTiposMovimiento,
  registrarMovimiento,
} from '../../api/inventario';

export default function InventarioTab({ orden }) {
  const { apiFetch, user } = useAuth();

  const [items, setItems] = useState([]); // inventario_vehiculo + nombre/unidad hidratados
  const [tipoSalida, setTipoSalida] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [cantidades, setCantidades] = useState({}); // inv_id -> texto del input
  const [registrandoId, setRegistrandoId] = useState(null);
  const [mensaje, setMensaje] = useState('');

  const cargar = useCallback(async () => {
    setError('');
    try {
      const [vehiculo, catalogo, tipos] = await Promise.all([
        getInventarioVehiculo(apiFetch),
        getCatalogoInventario(apiFetch),
        getTiposMovimiento(apiFetch),
      ]);

      const catalogoPorId = new Map(catalogo.map((c) => [c.id, c]));
      setItems(
        vehiculo
          .map((v) => ({ ...v, catalogo: catalogoPorId.get(v.inv_id) }))
          .filter((v) => v.catalogo)
      );

      // "Salida" = cualquier tipo que no sea entrada -- es lo que usamos
      // para registrar consumo en campo (ver postMovimientosInventario).
      setTipoSalida(tipos.find((t) => !t.es_entrada) ?? null);
    } catch (err) {
      setError(err.message);
    }
  }, [apiFetch]);

  useEffect(() => {
    setCargando(true);
    cargar().finally(() => setCargando(false));
  }, [cargar]);

  const registrarUso = async (item) => {
    setError('');
    setMensaje('');
    const cantidad = Number(cantidades[item.inv_id]);

    if (!cantidad || cantidad <= 0) {
      setError('Escribe una cantidad válida');
      return;
    }
    if (cantidad > Number(item.cantidad)) {
      setError(`Solo tienes ${item.cantidad} ${item.catalogo.unidad_medida} disponibles`);
      return;
    }
    if (!tipoSalida) {
      setError('No hay un tipo de movimiento de salida configurado');
      return;
    }

    setRegistrandoId(item.inv_id);
    try {
      await registrarMovimiento(apiFetch, {
        inv_id: item.inv_id,
        ord_id: orden.id,
        usu_id: user.id,
        tip_id: tipoSalida.id,
        cantidad,
      });
      setCantidades((prev) => ({ ...prev, [item.inv_id]: '' }));
      setMensaje(`Registrado: ${cantidad} ${item.catalogo.unidad_medida} de ${item.catalogo.nombre}`);
      await cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setRegistrandoId(null);
    }
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {mensaje ? <Text style={styles.mensaje}>{mensaje}</Text> : null}

      {items.length === 0 ? (
        <Text style={styles.vacio}>No tienes inventario asignado en tu vehículo.</Text>
      ) : (
        items.map((item) => (
          <View key={item.id} style={styles.item}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemNombre}>{item.catalogo.nombre}</Text>
              <Text style={styles.itemDisponible}>
                Disponible: {item.cantidad} {item.catalogo.unidad_medida}
              </Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="0"
              keyboardType="numeric"
              value={cantidades[item.inv_id] ?? ''}
              onChangeText={(v) => setCantidades((prev) => ({ ...prev, [item.inv_id]: v }))}
            />
            <Pressable
              style={styles.boton}
              onPress={() => registrarUso(item)}
              disabled={registrandoId === item.inv_id}
            >
              {registrandoId === item.inv_id ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.botonTexto}>Usar</Text>
              )}
            </Pressable>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centrado: { paddingVertical: 24, alignItems: 'center' },
  vacio: { color: '#6b7280', textAlign: 'center', paddingVertical: 24 },
  error: { color: '#dc2626', marginBottom: 12 },
  mensaje: { color: '#15803d', marginBottom: 12 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 8 },
  itemInfo: { flex: 1 },
  itemNombre: { fontSize: 15, fontWeight: '600', color: '#111827' },
  itemDisponible: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  input: {
    width: 56,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 8,
    textAlign: 'center',
  },
  boton: { backgroundColor: '#111827', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
  botonTexto: { color: '#fff', fontWeight: '600' },
});
