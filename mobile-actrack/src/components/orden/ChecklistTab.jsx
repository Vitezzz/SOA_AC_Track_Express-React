import { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import {
  getPlantillasChecklist,
  getItemsPlantilla,
  getEjecucionesOrden,
  crearEjecucion,
  actualizarEjecucion,
} from '../../api/checklist';
import Icon from '../Icon';

export default function ChecklistTab({ orden }) {
  const { apiFetch } = useAuth();

  const [plantilla, setPlantilla] = useState(null);
  const [items, setItems] = useState([]);
  const [ejecuciones, setEjecuciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [guardandoId, setGuardandoId] = useState(null);
  const [notaAdhoc, setNotaAdhoc] = useState('');
  const [agregando, setAgregando] = useState(false);

  const cargar = useCallback(async () => {
    setError('');
    try {
      const [plantillas, itemsTodos, ejecucionesOrden] = await Promise.all([
        getPlantillasChecklist(apiFetch),
        getItemsPlantilla(apiFetch),
        getEjecucionesOrden(apiFetch, orden.id),
      ]);

      const plantillaOrden = plantillas.find((p) => p.cat_id === orden.cat_id && p.activo) ?? null;
      setPlantilla(plantillaOrden);
      setItems(
        plantillaOrden
          ? itemsTodos.filter((i) => i.che_id === plantillaOrden.id).sort((a, b) => a.orden - b.orden)
          : []
      );
      setEjecuciones(ejecucionesOrden);
    } catch (err) {
      setError(err.message);
    }
  }, [apiFetch, orden.id, orden.cat_id]);

  useEffect(() => {
    setCargando(true);
    cargar().finally(() => setCargando(false));
  }, [cargar]);

  const ejecucionDeItem = (itemId) => ejecuciones.find((e) => e.item_id === itemId);
  const ejecucionesAdhoc = ejecuciones.filter((e) => e.item_id == null);

  const toggleItem = async (item) => {
    setGuardandoId(item.id);
    setError('');
    try {
      const existente = ejecucionDeItem(item.id);
      if (existente) {
        await actualizarEjecucion(apiFetch, existente.id, {
          che_id: plantilla.id,
          ord_id: orden.id,
          item_id: item.id,
          completado: !existente.completado,
        });
      } else {
        await crearEjecucion(apiFetch, {
          che_id: plantilla.id,
          ord_id: orden.id,
          item_id: item.id,
          completado: true,
        });
      }
      await cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardandoId(null);
    }
  };

  const agregarAdhoc = async () => {
    const texto = notaAdhoc.trim();
    if (!texto || !plantilla) return;
    setAgregando(true);
    setError('');
    try {
      await crearEjecucion(apiFetch, {
        che_id: plantilla.id,
        ord_id: orden.id,
        item_desc: texto,
        completado: true,
      });
      setNotaAdhoc('');
      await cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setAgregando(false);
    }
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!plantilla) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.vacio}>No hay checklist definido para esta categoría de servicio.</Text>
      </View>
    );
  }

  return (
    <View>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.tituloPlantilla}>{plantilla.nombre}</Text>

      {items.map((item) => {
        const ejecucion = ejecucionDeItem(item.id);
        const completado = ejecucion?.completado ?? false;
        return (
          <Pressable
            key={item.id}
            style={styles.item}
            onPress={() => toggleItem(item)}
            disabled={guardandoId === item.id}
          >
            <View style={[styles.checkbox, completado && styles.checkboxMarcado]}>
              {guardandoId === item.id ? (
                <ActivityIndicator size="small" color={completado ? '#fff' : '#111827'} />
              ) : (
                completado && <Icon name="check" size={13} color="#fff" />
              )}
            </View>
            <Text style={[styles.itemTexto, completado && styles.itemTextoCompletado]}>{item.descripcion}</Text>
          </Pressable>
        );
      })}

      {ejecucionesAdhoc.length > 0 && (
        <>
          <Text style={styles.subtitulo}>Ítems agregados</Text>
          {ejecucionesAdhoc.map((e) => (
            <View key={e.id} style={styles.item}>
              <View style={[styles.checkbox, styles.checkboxMarcado]}>
                <Icon name="check" size={13} color="#fff" />
              </View>
              <Text style={styles.itemTexto}>{e.item_desc}</Text>
            </View>
          ))}
        </>
      )}

      <Text style={styles.subtitulo}>Agregar hallazgo (no estaba en la plantilla)</Text>
      <View style={styles.adhocRow}>
        <TextInput
          style={styles.adhocInput}
          placeholder="Describe lo que encontraste..."
          value={notaAdhoc}
          onChangeText={setNotaAdhoc}
        />
        <Pressable style={styles.adhocBoton} onPress={agregarAdhoc} disabled={agregando}>
          {agregando ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.adhocBotonTexto}>+</Text>}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centrado: { paddingVertical: 24, alignItems: 'center' },
  vacio: { color: '#6b7280', textAlign: 'center' },
  error: { color: '#dc2626', marginBottom: 12 },
  tituloPlantilla: { fontSize: 13, fontWeight: '700', color: '#6b7280', marginBottom: 12, textTransform: 'uppercase' },
  subtitulo: { fontSize: 13, fontWeight: '700', color: '#6b7280', marginTop: 20, marginBottom: 8, textTransform: 'uppercase' },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxMarcado: { backgroundColor: '#111827', borderColor: '#111827' },
  itemTexto: { flex: 1, fontSize: 15, color: '#111827' },
  itemTextoCompletado: { color: '#6b7280', textDecorationLine: 'line-through' },
  adhocRow: { flexDirection: 'row', gap: 8 },
  adhocInput: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10 },
  adhocBoton: {
    width: 44,
    borderRadius: 8,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adhocBotonTexto: { color: '#fff', fontSize: 20, fontWeight: '700' },
});
