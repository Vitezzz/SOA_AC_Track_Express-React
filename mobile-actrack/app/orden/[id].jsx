import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useOrdenDetalle } from '../../src/hooks/useOrdenDetalle';
import InfoTab from '../../src/components/orden/InfoTab';
import ChecklistTab from '../../src/components/orden/ChecklistTab';
import CotizarTab from '../../src/components/orden/CotizarTab';
import InventarioTab from '../../src/components/orden/InventarioTab';
import PagoTab from '../../src/components/orden/PagoTab';
import CierreTab from '../../src/components/orden/CierreTab';

const TABS = [
  { key: 'info', label: 'Info' },
  { key: 'checklist', label: 'Checklist' },
  { key: 'cotizar', label: 'Cotizar' },
  { key: 'inventario', label: 'Inv.' },
  { key: 'pago', label: 'Pago' },
  { key: 'cierre', label: 'Cierre' },
];

export default function DetalleOrden() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { orden, cliente, equipo, cargando, error, recargar, setOrden } = useOrdenDetalle(id);
  const [tab, setTab] = useState('info');

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error || !orden || !cliente) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.error}>{error || 'No se pudo cargar la orden'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.volver}>← Agenda</Text>
        </Pressable>
        <Text style={styles.folio}>{orden.folio}</Text>
      </View>

      <View style={styles.tabBar}>
        {TABS.map((t) => (
          <Pressable key={t.key} style={[styles.tab, tab === t.key && styles.tabActivo]} onPress={() => setTab(t.key)}>
            <Text style={[styles.tabTexto, tab === t.key && styles.tabTextoActivo]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView style={styles.contenido} contentContainerStyle={{ paddingBottom: 40 }}>
        {tab === 'info' && <InfoTab orden={orden} cliente={cliente} equipo={equipo} recargar={recargar} />}
        {tab === 'checklist' && <ChecklistTab orden={orden} />}
        {tab === 'cotizar' && <CotizarTab orden={orden} />}
        {tab === 'inventario' && <InventarioTab orden={orden} />}
        {tab === 'pago' && <PagoTab orden={orden} />}
        {tab === 'cierre' && <CierreTab orden={orden} setOrden={setOrden} recargar={recargar} cliente={cliente} />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 56 },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { color: '#dc2626' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  volver: { color: '#2563eb' },
  folio: { fontWeight: '700', fontSize: 16 },
  tabBar: { flexDirection: 'row', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActivo: { borderBottomColor: '#111827' },
  tabTexto: { color: '#9ca3af', fontSize: 13 },
  tabTextoActivo: { color: '#111827', fontWeight: '600' },
  contenido: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },
});
