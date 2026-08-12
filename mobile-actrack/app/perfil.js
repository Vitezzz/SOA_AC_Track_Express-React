import { useCallback, useEffect, useState } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { View, Text, TextInput, Pressable, Switch, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { getMiPerfil, actualizarMiPerfil } from '../src/api/usuarios';
import { getMiTecnico, actualizarDisponibilidad } from '../src/api/tecnicos';
import Icon from '../src/components/Icon';

export default function Perfil() {
  const { user, loading: cargandoSesion, apiFetch } = useAuth();
  const router = useRouter();

  const [tecnico, setTecnico] = useState(null);
  const [form, setForm] = useState({ nombre: '', paterno: '', materno: '', email: '' });
  const [cargando, setCargando] = useState(true);
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [cambiandoDisponible, setCambiandoDisponible] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const cargar = useCallback(async () => {
    setError('');
    try {
      const [perfil, tecnicoCargado] = await Promise.all([
        getMiPerfil(apiFetch),
        getMiTecnico(apiFetch, user.id),
      ]);
      setForm({
        nombre: perfil.nombre ?? '',
        paterno: perfil.paterno ?? '',
        materno: perfil.materno ?? '',
        email: perfil.email ?? '',
      });
      setTecnico(tecnicoCargado);
    } catch (err) {
      setError(err.message);
    }
  }, [apiFetch, user?.id]);

  useEffect(() => {
    if (cargandoSesion || !user) return;
    setCargando(true);
    cargar().finally(() => setCargando(false));
  }, [cargandoSesion, user, cargar]);

  const guardarPerfil = async () => {
    setError('');
    setMensaje('');
    if (!form.nombre.trim() || !form.email.trim()) {
      setError('Nombre y correo son obligatorios');
      return;
    }
    setGuardandoPerfil(true);
    try {
      await actualizarMiPerfil(apiFetch, form);
      setMensaje('Perfil actualizado');
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardandoPerfil(false);
    }
  };

  const toggleDisponible = async () => {
    if (!tecnico) return;
    setError('');
    setCambiandoDisponible(true);
    try {
      const actualizado = await actualizarDisponibilidad(apiFetch, tecnico.id, {
        usu_id: tecnico.usu_id,
        esp_id: tecnico.esp_id,
        disponible: !tecnico.disponible,
      });
      setTecnico(actualizado);
    } catch (err) {
      setError(err.message);
    } finally {
      setCambiandoDisponible(false);
    }
  };

  if (cargandoSesion || cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) return <Redirect href="/login" />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.volver}>← Agenda</Text>
        </Pressable>
        <Text style={styles.titulo}>Mi Perfil</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {mensaje ? (
        <View style={styles.mensajeRow}>
          <Icon name="check" size={14} color="#15803d" />
          <Text style={styles.mensaje}>{mensaje}</Text>
        </View>
      ) : null}

      {tecnico && (
        <View style={styles.disponibleRow}>
          <Text style={styles.disponibleTexto}>Disponible para nuevas órdenes</Text>
          {cambiandoDisponible ? (
            <ActivityIndicator size="small" />
          ) : (
            <Switch value={tecnico.disponible} onValueChange={toggleDisponible} />
          )}
        </View>
      )}

      <Text style={styles.subtitulo}>Datos personales</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={form.nombre}
        onChangeText={(v) => setForm((prev) => ({ ...prev, nombre: v }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Apellido paterno"
        value={form.paterno}
        onChangeText={(v) => setForm((prev) => ({ ...prev, paterno: v }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Apellido materno"
        value={form.materno}
        onChangeText={(v) => setForm((prev) => ({ ...prev, materno: v }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Correo"
        autoCapitalize="none"
        keyboardType="email-address"
        value={form.email}
        onChangeText={(v) => setForm((prev) => ({ ...prev, email: v }))}
      />

      <Pressable style={styles.boton} onPress={guardarPerfil} disabled={guardandoPerfil}>
        {guardandoPerfil ? <ActivityIndicator color="#fff" /> : <Text style={styles.botonTexto}>Guardar</Text>}
      </Pressable>
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
  mensajeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  mensaje: { color: '#15803d' },
  disponibleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 14,
    marginBottom: 24,
  },
  disponibleTexto: { fontSize: 14, fontWeight: '600', color: '#111827' },
  subtitulo: { fontSize: 13, fontWeight: '700', color: '#6b7280', marginBottom: 12, textTransform: 'uppercase' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, marginBottom: 12 },
  boton: { backgroundColor: '#111827', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  botonTexto: { color: '#fff', fontWeight: '600' },
});
