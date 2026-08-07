import { View, Text, StyleSheet } from 'react-native';

export default function InfoTab({ orden, cliente, equipo }) {
  return (
    <View style={styles.container}>
      <Seccion titulo="Cliente">
        <Dato label="Nombre" valor={cliente.nombre} />
        <Dato label="Dirección" valor={cliente.direccion} />
        <Dato label="Teléfono" valor={cliente.telefono} />
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
});
