import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import {
  getInventarioVehiculo,
  getCatalogoInventario,
  getTiposMovimiento,
  registrarMovimiento,
  getMovimientosInventario,
} from '../../api/inventario';
import { getMisCotizaciones, getMisRenglonesCotizacion } from '../../api/cotizaciones';

export default function InventarioTab({ orden }) {
  const { apiFetch, user } = useAuth();

  const [items, setItems] = useState([]); // inventario_vehiculo + nombre/unidad hidratados
  const [tipoSalida, setTipoSalida] = useState(null);
  const [catalogo, setCatalogo] = useState([]);
  const [usoOrden, setUsoOrden] = useState([]); // piezas registradas aquí, para ESTA orden
  const [renglonesCotizacion, setRenglonesCotizacion] = useState([]); // piezas + mano de obra ya cotizadas
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [cantidades, setCantidades] = useState({}); // inv_id -> texto del input
  const [registrandoId, setRegistrandoId] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const timeoutMensajeRef = useRef(null);

  const cargar = useCallback(async () => {
    setError('');
    try {
      const [vehiculo, catalogoRes, tipos, movimientos, cotizaciones, renglones] = await Promise.all([
        getInventarioVehiculo(apiFetch),
        getCatalogoInventario(apiFetch),
        getTiposMovimiento(apiFetch),
        getMovimientosInventario(apiFetch),
        getMisCotizaciones(apiFetch),
        getMisRenglonesCotizacion(apiFetch),
      ]);

      const catalogoPorId = new Map(catalogoRes.map((c) => [c.id, c]));
      setItems(
        vehiculo
          .map((v) => ({ ...v, catalogo: catalogoPorId.get(v.inv_id) }))
          .filter((v) => v.catalogo)
      );
      setCatalogo(catalogoRes);

      // "Salida" = cualquier tipo que no sea entrada -- es lo que usamos
      // para registrar consumo en campo (ver postMovimientosInventario).
      setTipoSalida(tipos.find((t) => !t.es_entrada) ?? null);

      // Solo lo que YO registré para ESTA orden desde este mismo
      // formulario -- sin esto, el técnico no tenía forma de saber si ya
      // había registrado algo o no, salvo recordarlo de memoria.
      // Lo que ya se cotizó (y potencialmente se le cobrará al cliente)
      // para esta orden -- incluye piezas Y mano de obra. La mano de obra
      // se registra en la pestaña Cotizar, no aquí (no es un movimiento
      // de inventario, no hay pieza física que mover), pero se muestra
      // en este resumen para que quede claro dónde quedó y que sí existe.
      const cotizacionDeEstaOrden = cotizaciones.find((c) => c.ord_id === orden.id && c.estado !== 'rechazada');
      const renglonesDeEstaOrden = cotizacionDeEstaOrden
        ? renglones.filter((r) => r.cot_id === cotizacionDeEstaOrden.id)
        : [];
      setRenglonesCotizacion(renglonesDeEstaOrden);

      // Cada pieza que se agrega en Cotizar YA genera su propio movimiento
      // de salida (ver cotizacionDetalleController.js) -- sin excluirlos
      // de aquí, la misma pieza saldría dos veces en este resumen: una
      // como "movimiento" y otra como "cotizado". Se descarta cualquier
      // movimiento cuyo artículo+cantidad coincida con un renglón ya
      // cotizado, para que cada cosa aparezca una sola vez.
      // "cantidad" viene como numeric de Postgres -- en cotizacion_detalle
      // llega tipo "1.000" y en movimientos_inventario tipo "1", así que
      // hay que pasar ambos por Number() antes de comparar o nunca van a
      // hacer match como el mismo string.
      const piezasCotizadas = new Set(
        renglonesDeEstaOrden.filter((r) => !r.es_mano_obra).map((r) => `${r.inv_id}:${Number(r.cantidad)}`)
      );
      setUsoOrden(
        movimientos.filter(
          (m) => m.ord_id === orden.id && m.usu_id === user.id && !piezasCotizadas.has(`${m.inv_id}:${Number(m.cantidad)}`)
        )
      );
    } catch (err) {
      setError(err.message);
    }
  }, [apiFetch, orden.id, user.id]);

  useEffect(() => {
    setCargando(true);
    cargar().finally(() => setCargando(false));
  }, [cargar]);

  // El mensaje de éxito se quedaba en pantalla para siempre -- nada lo
  // volvía a poner en '', así que parecía que la app seguía "mandando"
  // la confirmación de un registro viejo aunque ya hubieran pasado varios
  // minutos (o varios registros más).
  useEffect(() => {
    if (!mensaje) return;
    clearTimeout(timeoutMensajeRef.current);
    timeoutMensajeRef.current = setTimeout(() => setMensaje(''), 4000);
    return () => clearTimeout(timeoutMensajeRef.current);
  }, [mensaje]);

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

  const hayUsoRegistrado = usoOrden.length > 0 || renglonesCotizacion.length > 0;

  return (
    <View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {mensaje ? <Text style={styles.mensaje}>{mensaje}</Text> : null}

      {hayUsoRegistrado && (
        <View style={styles.resumen}>
          <Text style={styles.resumenTitulo}>Ya registrado en esta orden</Text>
          {usoOrden.map((m) => {
            const articulo = catalogo.find((c) => c.id === m.inv_id);
            return (
              <View key={`mov-${m.id}`} style={styles.resumenFila}>
                <Text style={styles.resumenNombre}>{articulo?.nombre || 'Artículo'}</Text>
                <Text style={styles.resumenCantidad}>{m.cantidad} {articulo?.unidad_medida || ''}</Text>
              </View>
            );
          })}
          {renglonesCotizacion.map((r) => {
            const articulo = catalogo.find((c) => c.id === r.inv_id);
            return (
              <View key={`cot-${r.id}`} style={styles.resumenFila}>
                <Text style={styles.resumenNombre}>
                  {r.es_mano_obra ? (r.concepto || 'Mano de obra') : (articulo?.nombre || 'Artículo')}
                  <Text style={styles.resumenEtiquetaCot}>  · cotizado</Text>
                </Text>
                <Text style={styles.resumenCantidad}>{r.cantidad}</Text>
              </View>
            );
          })}
          <Text style={styles.resumenNota}>
            Las piezas que sí se le van a cobrar al cliente y la mano de obra se registran desde la pestaña Cotizar.
          </Text>
        </View>
      )}

      <Text style={styles.subtitulo}>Registrar uso de material (sin cobrar al cliente)</Text>

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
  subtitulo: { fontSize: 13, fontWeight: '700', color: '#6b7280', marginBottom: 8, textTransform: 'uppercase' },
  resumen: { backgroundColor: '#f9fafb', borderRadius: 10, padding: 14, marginBottom: 20 },
  resumenTitulo: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8 },
  resumenFila: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  resumenNombre: { color: '#111827', fontSize: 13, flex: 1, marginRight: 8 },
  resumenEtiquetaCot: { color: '#9ca3af', fontSize: 11 },
  resumenCantidad: { color: '#111827', fontSize: 13, fontWeight: '600' },
  resumenNota: { color: '#9ca3af', fontSize: 11, marginTop: 8, lineHeight: 15 },
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
