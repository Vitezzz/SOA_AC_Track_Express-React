import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { actualizarOrden } from '../../api/ordenesServicio';
import PingsBotones from './PingsBotones';
import { ordenEstaCerrada } from '../../utils/estadosOrden';

export default function CierreTab({ orden, setOrden, cliente }) {
  const { apiFetch } = useAuth();
  const [cerrando, setCerrando] = useState(false);
  const [error, setError] = useState('');

  const confirmarCierre = () => {
    Alert.alert(
      'Cerrar servicio',
      'Se marcará la orden como completada y se le avisará al cliente. ¿Confirmas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar servicio', style: 'destructive', onPress: cerrarServicio },
      ]
    );
  };

  const cerrarServicio = async () => {
    setError('');
    setCerrando(true);
    try {
      // PUT es full-replace -- reenviamos la orden completa, solo cambiando
      // estatus y fecha_cierre.
      const actualizada = await actualizarOrden(apiFetch, orden.id, {
        cli_id: orden.cli_id,
        equ_id: orden.equ_id,
        cat_id: orden.cat_id,
        pri_id: orden.pri_id,
        folio: orden.folio,
        prioridad: orden.prioridad,
        estatus: 'completada',
        descripcion: orden.descripcion,
        fecha_programada: orden.fecha_programada,
        fecha_cierre: new Date().toISOString(),
        tec_id: orden.tec_id,
        duracion_estimada_horas: orden.duracion_estimada_horas,
      });
      setOrden(actualizada);
    } catch (err) {
      setError(err.message);
    } finally {
      setCerrando(false);
    }
  };

  const yaCerrada = ordenEstaCerrada(orden.estatus);

  return (
    <View>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={[styles.estatusBox, yaCerrada && styles.estatusBoxCerrada]}>
        <Text style={styles.estatusLabel}>Estatus actual</Text>
        <Text style={styles.estatusValor}>{orden.estatus}</Text>
      </View>

      {!yaCerrada && (
        <>
          <Text style={styles.subtitulo}>Avisar al cliente</Text>
          <View style={{ marginBottom: 24 }}>
            <PingsBotones ordenId={orden.id} estatusOrden={orden.estatus} cliente={cliente} />
          </View>

          <Pressable style={styles.cerrarBoton} onPress={confirmarCierre} disabled={cerrando}>
            {cerrando ? <ActivityIndicator color="#fff" /> : <Text style={styles.cerrarTexto}>Cerrar servicio</Text>}
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  error: { color: '#dc2626', marginBottom: 12 },
  estatusBox: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  estatusBoxCerrada: { backgroundColor: '#dcfce7' },
  estatusLabel: { fontSize: 11, color: '#6b7280', textTransform: 'uppercase' },
  estatusValor: { fontSize: 16, fontWeight: '700', color: '#111827', textTransform: 'capitalize', marginTop: 2 },
  subtitulo: { fontSize: 13, fontWeight: '700', color: '#6b7280', marginBottom: 8, textTransform: 'uppercase' },
  cerrarBoton: { backgroundColor: '#111827', borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  cerrarTexto: { color: '#fff', fontWeight: '700' },
});
