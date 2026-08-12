import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { abrirNavegacion } from '../../utils/navegacion';

export default function InfoTab({ orden, cliente, equipo }) {
  const router = useRouter();
  const tieneUbicacion = cliente.latitud && cliente.longitud;

  return (
    <View style={styles.container}>
      <Seccion titulo="Cliente">
        <Dato label="Nombre" valor={cliente.nombre} />
        <Dato label="Dirección" valor={cliente.direccion} />
        <Dato label="Teléfono" valor={cliente.telefono} />
        {tieneUbicacion ? (
          <View style={styles.navegarRow}>
            <Pressable
              style={[styles.navegarBoton, styles.navegarBotonSecundario]}
              onPress={() =>
                router.push({
                  pathname: '/navegar/[id]',
                  params: { id: orden.id, lat: cliente.latitud, lng: cliente.longitud, nombre: cliente.nombre, folio: orden.folio },
                })
              }
            >
              <Text style={[styles.navegarTexto, styles.navegarTextoSecundario]}>Navegar en la app</Text>
            </Pressable>
            <Pressable style={styles.navegarBoton} onPress={() => abrirNavegacion(cliente.latitud, cliente.longitud)}>
              <Text style={styles.navegarTexto}>Cómo llegar</Text>
            </Pressable>
          </View>
        ) : (
          <Text style={styles.sinUbicacion}>Este cliente no tiene ubicación guardada</Text>
        )}
      </Seccion>

      <Seccion titulo="Equipo">
        {equipo ? (
          <>
            <Dato label="Tipo" valor={equipo.tipo} />
            <Dato label="Modelo" valor={equipo.modelo} />
            <Dato label="Número de serie" valor={equipo.numero_serie} />
          </>
        ) : (
          <Text style={styles.sinEquipo}>Sin equipo asociado</Text>
        )}
      </Seccion>

      <Seccion titulo="Orden">
        <Dato label="Prioridad" valor={orden.prioridad} />
        <Dato label="Estatus" valor={orden.estatus} />
        <Dato label="Descripción" valor={orden.descripcion} />
      </Seccion>
    </View>
  );
}

const Seccion = ({ titulo, children }) => (
  <View style={styles.seccion}>
    <Text style={styles.seccionTitulo}>{titulo}</Text>
    {children}
  </View>
);

const Dato = ({ label, valor }) => (
  <View style={styles.dato}>
    <Text style={styles.datoLabel}>{label}</Text>
    <Text style={styles.datoValor}>{valor || '—'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { paddingVertical: 8 },
  seccion: { marginBottom: 20 },
  seccionTitulo: { fontSize: 13, fontWeight: '700', color: '#6b7280', marginBottom: 8, textTransform: 'uppercase' },
  dato: { marginBottom: 8 },
  datoLabel: { fontSize: 12, color: '#9ca3af' },
  datoValor: { fontSize: 15, color: '#111827' },
  sinEquipo: { color: '#9ca3af', fontStyle: 'italic' },
  navegarRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  navegarBoton: { backgroundColor: '#111827', borderRadius: 8, paddingVertical: 10, alignItems: 'center', paddingHorizontal: 16 },
  navegarBotonSecundario: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#111827' },
  navegarTexto: { color: '#fff', fontWeight: '600', fontSize: 13 },
  navegarTextoSecundario: { color: '#111827' },
  sinUbicacion: { color: '#b45309', fontSize: 12, marginTop: 6 },
});
