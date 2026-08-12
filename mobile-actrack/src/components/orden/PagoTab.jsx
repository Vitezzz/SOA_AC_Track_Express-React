import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { usePagoOrden } from '../../hooks/usePagoOrden';
import { registrarPago } from '../../api/pagos';
import { useAuth } from '../../context/AuthContext';

const METODOS = [
  { valor: 'efectivo', etiqueta: 'Efectivo' },
  { valor: 'transferencia', etiqueta: 'Transferencia' },
  { valor: 'tarjeta', etiqueta: 'Tarjeta' },
  { valor: 'otro', etiqueta: 'Otro' },
];

const formatoMoneda = (valor) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(valor);

export default function PagoTab({ orden }) {
  const { apiFetch } = useAuth();
  const { cotizacionAprobada, pagos, sumaYaPagada, saldoPendiente, cargando, error, recargar } = usePagoOrden(orden.id);

  const [metodo, setMetodo] = useState('efectivo');
  const [monto, setMonto] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState('');

  const confirmarCobro = () => {
    const montoNum = Number(monto);
    if (!montoNum || montoNum <= 0) {
      setErrorForm('Ingresa un monto válido');
      return;
    }
    if (saldoPendiente != null && montoNum > saldoPendiente) {
      setErrorForm(`El monto excede el saldo pendiente (${formatoMoneda(saldoPendiente)})`);
      return;
    }
    Alert.alert(
      'Confirmar cobro',
      `¿Confirmas que recibiste ${formatoMoneda(montoNum)} en ${METODOS.find((m) => m.valor === metodo)?.etiqueta.toLowerCase()}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: () => cobrar(montoNum) },
      ]
    );
  };

  const cobrar = async (montoNum) => {
    setErrorForm('');
    setGuardando(true);
    try {
      await registrarPago(apiFetch, { ord_id: orden.id, cli_id: orden.cli_id, metodo, monto: montoNum });
      setMonto('');
      await recargar();
    } catch (err) {
      setErrorForm(err.message);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error) return <Text style={styles.error}>{error}</Text>;

  if (!cotizacionAprobada) {
    return <Text style={styles.aviso}>Esta orden todavía no tiene una cotización aprobada -- no se puede cobrar.</Text>;
  }

  return (
    <View>
      <View style={styles.resumen}>
        <Fila label="Total cotizado" valor={formatoMoneda(cotizacionAprobada.total)} />
        <Fila label="Ya cobrado" valor={formatoMoneda(sumaYaPagada)} />
        <Fila
          label="Saldo pendiente"
          valor={formatoMoneda(saldoPendiente)}
          color={saldoPendiente > 0 ? '#b91c1c' : '#15803d'}
        />
      </View>

      {saldoPendiente <= 0 ? (
        <Text style={styles.pagada}>Esta orden ya está completamente pagada.</Text>
      ) : (
        <>
          {errorForm ? <Text style={styles.error}>{errorForm}</Text> : null}

          <Text style={styles.subtitulo}>Método de pago</Text>
          <View style={styles.metodos}>
            {METODOS.map((m) => (
              <Pressable
                key={m.valor}
                style={[styles.metodoBoton, metodo === m.valor && styles.metodoBotonActivo]}
                onPress={() => setMetodo(m.valor)}
              >
                <Text style={[styles.metodoTexto, metodo === m.valor && styles.metodoTextoActivo]}>{m.etiqueta}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.subtitulo}>Monto recibido</Text>
          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            placeholder="0.00"
            value={monto}
            onChangeText={setMonto}
          />

          <Pressable style={styles.cobrarBoton} onPress={confirmarCobro} disabled={guardando}>
            {guardando ? <ActivityIndicator color="#fff" /> : <Text style={styles.cobrarTexto}>Confirmar cobro</Text>}
          </Pressable>
        </>
      )}

      {pagos.length > 0 && (
        <>
          <Text style={[styles.subtitulo, { marginTop: 24 }]}>Pagos registrados</Text>
          {pagos.map((p) => (
            <View key={p.id} style={styles.pagoFila}>
              <Text style={styles.pagoMetodo}>{METODOS.find((m) => m.valor === p.metodo)?.etiqueta ?? p.metodo}</Text>
              <Text style={styles.pagoMonto}>{formatoMoneda(p.monto)}</Text>
              <Text style={styles.pagoEstado}>{p.estado}</Text>
            </View>
          ))}
        </>
      )}
    </View>
  );
}

const Fila = ({ label, valor, color }) => (
  <View style={styles.fila}>
    <Text style={styles.filaLabel}>{label}</Text>
    <Text style={[styles.filaValor, color && { color }]}>{valor}</Text>
  </View>
);

const styles = StyleSheet.create({
  centrado: { paddingVertical: 24, alignItems: 'center' },
  error: { color: '#dc2626', marginBottom: 12 },
  aviso: { color: '#b45309', fontSize: 14 },
  pagada: { color: '#15803d', fontSize: 14, fontWeight: '600' },
  resumen: { backgroundColor: '#f9fafb', borderRadius: 10, padding: 14, marginBottom: 20 },
  fila: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  filaLabel: { color: '#6b7280', fontSize: 13 },
  filaValor: { fontWeight: '700', fontSize: 13, color: '#111827' },
  subtitulo: { fontSize: 13, fontWeight: '700', color: '#6b7280', marginBottom: 8, textTransform: 'uppercase' },
  metodos: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  metodoBoton: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
  metodoBotonActivo: { backgroundColor: '#111827', borderColor: '#111827' },
  metodoTexto: { color: '#111827', fontSize: 13 },
  metodoTextoActivo: { color: '#fff', fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  cobrarBoton: { backgroundColor: '#111827', borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  cobrarTexto: { color: '#fff', fontWeight: '700' },
  pagoFila: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  pagoMetodo: { color: '#111827', fontSize: 13, flex: 1 },
  pagoMonto: { color: '#111827', fontSize: 13, fontWeight: '600' },
  pagoEstado: { color: '#6b7280', fontSize: 12, textTransform: 'capitalize', marginLeft: 8 },
});
