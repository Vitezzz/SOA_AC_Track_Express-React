import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { abrirNavegacion } from '../../utils/navegacion';
import { getMarcas, crearEquipo } from '../../api/equipos';
import { actualizarOrden } from '../../api/ordenesServicio';

export default function InfoTab({ orden, cliente, equipo, recargar }) {
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
          <RegistrarEquipo orden={orden} cliente={cliente} recargar={recargar} />
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

// Cuando la orden se pidió sin equipo (instalación nueva, o "otro" en
// Solicitud de Servicio), no había forma de capturarlo salvo que alguien
// en oficina lo transcribiera después de las notas de la cotización. Se
// registra aquí mismo, al momento de instalarlo, y se enlaza a la orden.
const RegistrarEquipo = ({ orden, cliente, recargar }) => {
  const { apiFetch } = useAuth();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [marcas, setMarcas] = useState([]);
  const [marId, setMarId] = useState(null);
  const [tipo, setTipo] = useState('');
  const [modelo, setModelo] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!mostrarForm || marcas.length > 0) return;
    getMarcas(apiFetch).then(setMarcas).catch((err) => setError(err.message));
  }, [mostrarForm, marcas.length, apiFetch]);

  if (!mostrarForm) {
    return (
      <View>
        <Text style={styles.sinEquipo}>Sin equipo asociado</Text>
        <Pressable style={styles.botonRegistrar} onPress={() => setMostrarForm(true)}>
          <Text style={styles.botonRegistrarTexto}>+ Registrar equipo instalado</Text>
        </Pressable>
      </View>
    );
  }

  const confirmarGuardar = () => {
    setError('');
    if (!marId || !tipo || !modelo || !numeroSerie) {
      setError('Completa marca, tipo, modelo y número de serie');
      return;
    }
    // Es un registro permanente en el catálogo del cliente -- una vez
    // guardado, solo se puede corregir desde oficina (admin), no desde
    // aquí. Se confirma antes, para no dejar un equipo mal capturado
    // (número de serie con typo, etc.) por un tap accidental.
    Alert.alert(
      'Registrar equipo',
      `¿Confirmas los datos?\n\n${tipo} · ${modelo}\nNúmero de serie: ${numeroSerie}`,
      [
        { text: 'Revisar de nuevo', style: 'cancel' },
        { text: 'Guardar', onPress: guardar },
      ]
    );
  };

  const guardar = async () => {
    setGuardando(true);
    try {
      const nuevoEquipo = await crearEquipo(apiFetch, {
        cli_id: cliente.id, mar_id: marId, modelo, numero_serie: numeroSerie, tipo,
      });
      await actualizarOrden(apiFetch, orden.id, {
        cli_id: orden.cli_id, equ_id: nuevoEquipo.id, cat_id: orden.cat_id, pri_id: orden.pri_id,
        folio: orden.folio, prioridad: orden.prioridad, estatus: orden.estatus,
        descripcion: orden.descripcion, fecha_programada: orden.fecha_programada,
        fecha_cierre: orden.fecha_cierre, tec_id: orden.tec_id,
        duracion_estimada_horas: orden.duracion_estimada_horas,
      });
      await recargar();
    } catch (err) {
      setError(err.message);
      Alert.alert('No se pudo registrar el equipo', err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <View>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.campoLabel}>Marca</Text>
      {marcas.length === 0 ? (
        <ActivityIndicator style={{ marginVertical: 8 }} />
      ) : (
        <View style={styles.chips}>
          {marcas.map((m) => (
            <Pressable
              key={m.id}
              style={[styles.chip, marId === m.id && styles.chipActivo]}
              onPress={() => setMarId(m.id)}
            >
              <Text style={[styles.chipTexto, marId === m.id && styles.chipTextoActivo]}>{m.nombre}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <Text style={styles.campoLabel}>Tipo</Text>
      <TextInput style={styles.input} placeholder="Ej. Split Pared, Cassette..." value={tipo} onChangeText={setTipo} />

      <Text style={styles.campoLabel}>Modelo</Text>
      <TextInput style={styles.input} value={modelo} onChangeText={setModelo} />

      <Text style={styles.campoLabel}>Número de serie</Text>
      <TextInput style={styles.input} value={numeroSerie} onChangeText={setNumeroSerie} autoCapitalize="characters" />

      <View style={styles.accionesForm}>
        <Pressable style={styles.botonGuardar} onPress={confirmarGuardar} disabled={guardando}>
          {guardando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botonGuardarTexto}>Guardar equipo</Text>}
        </Pressable>
        <Pressable style={styles.botonCancelar} onPress={() => setMostrarForm(false)} disabled={guardando}>
          <Text style={styles.botonCancelarTexto}>Cancelar</Text>
        </Pressable>
      </View>
    </View>
  );
};

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
  error: { color: '#dc2626', marginBottom: 8, fontSize: 13 },
  botonRegistrar: { marginTop: 10, alignSelf: 'flex-start' },
  botonRegistrarTexto: { color: '#2563eb', fontSize: 13, fontWeight: '600' },
  campoLabel: { fontSize: 13, color: '#374151', marginBottom: 6, marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, fontSize: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  chipActivo: { backgroundColor: '#111827', borderColor: '#111827' },
  chipTexto: { color: '#111827', fontSize: 13 },
  chipTextoActivo: { color: '#fff', fontWeight: '600' },
  accionesForm: { flexDirection: 'row', gap: 10, marginTop: 16 },
  botonGuardar: { flex: 1, backgroundColor: '#111827', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  botonGuardarTexto: { color: '#fff', fontWeight: '700' },
  botonCancelar: { paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center' },
  botonCancelarTexto: { color: '#6b7280', fontWeight: '600' },
});
