import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Switch, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useCotizacionOrden } from '../../hooks/useCotizacionOrden';
import { getMiTecnico } from '../../api/tecnicos';
import { getInventarioVehiculo, getCatalogoInventario } from '../../api/inventario';
import { crearCotizacion, actualizarCotizacion, agregarRenglonCotizacion } from '../../api/cotizaciones';
import { getCategoriaServicio } from '../../api/categorias';

const formatoMoneda = (valor) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(valor);

const ETIQUETA_ESTADO = {
  borrador: 'Borrador -- agrega piezas/mano de obra y envíala',
  enviada: 'Enviada -- esperando respuesta del cliente',
  aprobada: 'Aprobada -- ya puedes cobrar en la pestaña Pago',
};

export default function CotizarTab({ orden }) {
  const { apiFetch, user } = useAuth();
  const { cotizacionActiva, renglones, cargando, error, recargar } = useCotizacionOrden(orden.id);

  const [miTecId, setMiTecId] = useState(null);
  const [stockVehiculo, setStockVehiculo] = useState([]);
  const [catalogo, setCatalogo] = useState([]);
  const [categoriaOrden, setCategoriaOrden] = useState(null);

  const [creando, setCreando] = useState(false);
  const [notas, setNotas] = useState('');
  const [errorForm, setErrorForm] = useState('');

  const [esManoObra, setEsManoObra] = useState(false);
  const [invId, setInvId] = useState(null);
  const [concepto, setConcepto] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [precioUnitario, setPrecioUnitario] = useState('');
  const [agregando, setAgregando] = useState(false);

  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [tecnico, vehiculo, cat, categoria] = await Promise.all([
          getMiTecnico(apiFetch, user.id),
          getInventarioVehiculo(apiFetch),
          getCatalogoInventario(apiFetch),
          orden.cat_id ? getCategoriaServicio(apiFetch, orden.cat_id) : Promise.resolve(null),
        ]);
        setMiTecId(tecnico?.id ?? null);
        const catalogoPorId = new Map(cat.map((c) => [c.id, c]));
        setStockVehiculo(vehiculo.map((v) => ({ ...v, catalogo: catalogoPorId.get(v.inv_id) })).filter((v) => v.catalogo));
        setCatalogo(cat);
        setCategoriaOrden(categoria);
        if (!tecnico) {
          // No debería pasar en uso normal (todo técnico logueado tiene su
          // fila en tecnicos), pero si pasa, mejor que se note de inmediato
          // en vez de que el botón de abajo se quede sin hacer nada.
          Alert.alert('No se pudo cargar tu perfil', 'No encontramos tu registro de técnico. Cierra sesión y vuelve a entrar; si sigue igual, avísale a soporte.');
        }
      } catch (err) {
        setErrorForm(err.message);
        Alert.alert('No se pudo cargar la pantalla de Cotizar', err.message);
      }
    })();
  }, [apiFetch, user.id, orden.cat_id]);

  const iniciarCotizacion = async () => {
    setErrorForm('');
    if (!miTecId) {
      setErrorForm('No se pudo identificar tu perfil de técnico');
      Alert.alert('No se pudo identificar tu perfil de técnico', 'Cierra sesión y vuelve a entrar; si sigue igual, avísale a soporte.');
      return;
    }
    // Si ya hay una cotización activa para esta orden, esta pantalla no
    // debería ni mostrar este botón (ver el "if (!cotizacionActiva)" de
    // abajo) -- este seguro es solo por si un doble-tap alcanza a
    // dispararse antes de que la pantalla cambie, para no crear una
    // segunda cotización duplicada por accidente.
    if (cotizacionActiva) {
      await recargar();
      return;
    }
    setCreando(true);
    try {
      await crearCotizacion(apiFetch, { ord_id: orden.id, tec_id: miTecId, cli_id: orden.cli_id, notas });
      await recargar();
      Alert.alert('Cotización iniciada', 'Ahora agrega piezas o mano de obra antes de enviarla.');
    } catch (err) {
      setErrorForm(err.message);
      Alert.alert('No se pudo crear la cotización', err.message);
    } finally {
      setCreando(false);
    }
  };

  const limpiarFormRenglon = () => {
    setInvId(null);
    setConcepto('');
    setCantidad('');
    setPrecioUnitario('');
    setEsManoObra(false);
  };

  // Solo precarga el formulario -- no agrega el renglón solo. El técnico
  // sigue teniendo que revisar y tocar "+ Agregar renglón", así puede
  // ajustar el precio si esta vez sí hubo algo extra (una pieza, más
  // tiempo del normal, etc.) antes de que quede guardado.
  const usarPrecioSugerido = () => {
    setEsManoObra(true);
    setInvId(null);
    setConcepto(categoriaOrden.nombre);
    setCantidad('1');
    setPrecioUnitario(String(categoriaOrden.precio_sugerido));
  };

  const agregarRenglon = async () => {
    setErrorForm('');
    if ((!esManoObra && !invId) || !cantidad || !precioUnitario) {
      setErrorForm('Completa artículo, cantidad y precio unitario');
      return;
    }
    if (esManoObra && !concepto) {
      setErrorForm('Describe en qué consistió la mano de obra');
      return;
    }
    setAgregando(true);
    try {
      await agregarRenglonCotizacion(apiFetch, {
        inv_id: invId,
        cot_id: cotizacionActiva.id,
        cantidad: Number(cantidad),
        precio_unitario: Number(precioUnitario),
        es_mano_obra: esManoObra,
        concepto,
      });
      limpiarFormRenglon();
      await recargar();
    } catch (err) {
      setErrorForm(err.message);
    } finally {
      setAgregando(false);
    }
  };

  const enviarCotizacion = () => {
    Alert.alert(
      'Enviar cotización',
      `Se le notificará al cliente esta cotización por ${formatoMoneda(cotizacionActiva.total)}. ¿Confirmas?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Enviar', onPress: confirmarEnvio },
      ]
    );
  };

  const confirmarEnvio = async () => {
    setErrorForm('');
    setEnviando(true);
    try {
      await actualizarCotizacion(apiFetch, cotizacionActiva.id, {
        ord_id: cotizacionActiva.ord_id,
        tec_id: cotizacionActiva.tec_id,
        cli_id: cotizacionActiva.cli_id,
        folio: cotizacionActiva.folio,
        estado: 'enviada',
        total: cotizacionActiva.total,
        notas: cotizacionActiva.notas,
      });
      await recargar();
    } catch (err) {
      setErrorForm(err.message);
    } finally {
      setEnviando(false);
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

  // "pendiente" solo deja de serlo cuando el técnico marca "Ya llegué"
  // (bitacoraEstadosController.js lo pasa a en_proceso automático en ese
  // momento) -- así que si sigue en pendiente, todavía no ha estado ahí.
  // No tiene sentido cotizar un equipo que no se ha visto. Si YA existe
  // una cotización (se empezó antes de este candado, o la hizo alguien de
  // oficina), se deja seguir editándola -- este bloqueo es solo para
  // EMPEZAR una nueva a ciegas.
  if (!cotizacionActiva && orden.estatus === 'pendiente') {
    return (
      <View>
        <Text style={styles.intro}>
          Todavía no puedes cotizar esta orden -- primero marca &quot;Ya llegué&quot; en la pestaña Cierre (necesita
          que el GPS confirme que estás cerca). Cotizar antes de ver el equipo no tiene caso.
        </Text>
      </View>
    );
  }

  // Sin cotización activa todavía -- pantalla para arrancar una.
  if (!cotizacionActiva) {
    return (
      <View>
        {errorForm ? <Text style={styles.error}>{errorForm}</Text> : null}
        <Text style={styles.intro}>
          Diagnostica el equipo primero (pestaña Checklist). Cuando sepas qué se necesita, arranca la cotización aquí
          mismo -- podrás agregar piezas de tu vehículo y mano de obra antes de enviársela al cliente.
        </Text>
        <Text style={styles.subtitulo}>Notas (opcional)</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Ej. Diagnóstico: capacitor dañado, requiere reemplazo"
          value={notas}
          onChangeText={setNotas}
          multiline
        />
        <Pressable style={styles.botonPrimario} onPress={iniciarCotizacion} disabled={creando}>
          {creando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botonTexto}>Iniciar cotización</Text>}
        </Pressable>
      </View>
    );
  }

  const esBorrador = cotizacionActiva.estado === 'borrador';

  return (
    <View>
      {errorForm ? <Text style={styles.error}>{errorForm}</Text> : null}

      <View style={styles.resumen}>
        <Text style={styles.estadoTexto}>{ETIQUETA_ESTADO[cotizacionActiva.estado] || cotizacionActiva.estado}</Text>
        <View style={styles.filaTotal}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValor}>{formatoMoneda(cotizacionActiva.total)}</Text>
        </View>
      </View>

      {renglones.length > 0 && (
        <>
          <Text style={styles.subtitulo}>Piezas y mano de obra</Text>
          {renglones.map((r) => {
            const articulo = catalogo.find((c) => c.id === r.inv_id);
            return (
              <View key={r.id} style={styles.renglonFila}>
                <Text style={styles.renglonNombre}>
                  {r.es_mano_obra ? (r.concepto || 'Mano de obra') : (articulo?.nombre || 'Artículo')} × {r.cantidad}
                </Text>
                <Text style={styles.renglonSubtotal}>{formatoMoneda(r.subtotal)}</Text>
              </View>
            );
          })}
        </>
      )}

      {esBorrador && categoriaOrden?.precio_sugerido != null && (
        <View style={styles.sugerencia}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sugerenciaTitulo}>Precio sugerido para {categoriaOrden.nombre}</Text>
            <Text style={styles.sugerenciaMonto}>{formatoMoneda(categoriaOrden.precio_sugerido)}</Text>
          </View>
          <Pressable style={styles.sugerenciaBoton} onPress={usarPrecioSugerido}>
            <Text style={styles.sugerenciaBotonTexto}>Usar este precio</Text>
          </Pressable>
        </View>
      )}

      {esBorrador && (
        <>
          <Text style={[styles.subtitulo, { marginTop: 20 }]}>Agregar renglón</Text>

          <View style={styles.switchFila}>
            <Text style={styles.switchLabel}>Es mano de obra</Text>
            <Switch
              value={esManoObra}
              onValueChange={(v) => { setEsManoObra(v); setInvId(null); setPrecioUnitario(''); setConcepto(''); }}
            />
          </View>

          {!esManoObra ? (
            <>
              <Text style={styles.campoLabel}>Artículo (de tu vehículo)</Text>
              {stockVehiculo.length === 0 ? (
                <Text style={styles.vacio}>No tienes artículos en tu vehículo todavía.</Text>
              ) : (
                <View style={styles.chips}>
                  {stockVehiculo.map((s) => (
                    <Pressable
                      key={s.inv_id}
                      style={[styles.chip, invId === s.inv_id && styles.chipActivo]}
                      onPress={() => { setInvId(s.inv_id); setPrecioUnitario(String(s.catalogo.precio_venta ?? '')); }}
                    >
                      <Text style={[styles.chipTexto, invId === s.inv_id && styles.chipTextoActivo]}>
                        {s.catalogo.nombre} ({s.cantidad})
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </>
          ) : (
            <>
              <Text style={styles.campoLabel}>¿En qué consistió el trabajo?</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Instalación de capacitor, diagnóstico eléctrico..."
                value={concepto}
                onChangeText={setConcepto}
              />
            </>
          )}

          <Text style={styles.campoLabel}>Cantidad</Text>
          <TextInput style={styles.input} keyboardType="decimal-pad" placeholder="1" value={cantidad} onChangeText={setCantidad} />

          <Text style={styles.campoLabel}>Precio unitario</Text>
          <TextInput style={styles.input} keyboardType="decimal-pad" placeholder="0.00" value={precioUnitario} onChangeText={setPrecioUnitario} />

          <Pressable style={styles.botonSecundario} onPress={agregarRenglon} disabled={agregando}>
            {agregando ? <ActivityIndicator /> : <Text style={styles.botonSecundarioTexto}>+ Agregar renglón</Text>}
          </Pressable>

          <Pressable
            style={[styles.botonPrimario, { marginTop: 20 }, Number(cotizacionActiva.total) <= 0 && styles.botonDeshabilitado]}
            onPress={enviarCotizacion}
            disabled={enviando || Number(cotizacionActiva.total) <= 0}
          >
            {enviando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botonTexto}>Enviar cotización al cliente</Text>}
          </Pressable>
          {Number(cotizacionActiva.total) <= 0 && (
            <Text style={styles.avisoTotal}>Agrega al menos un renglón antes de enviarla.</Text>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centrado: { paddingVertical: 24, alignItems: 'center' },
  error: { color: '#dc2626', marginBottom: 12 },
  intro: { color: '#4b5563', fontSize: 13, lineHeight: 19, marginBottom: 16 },
  vacio: { color: '#6b7280', fontSize: 13, marginBottom: 12 },
  subtitulo: { fontSize: 13, fontWeight: '700', color: '#6b7280', marginBottom: 8, textTransform: 'uppercase' },
  campoLabel: { fontSize: 13, color: '#374151', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 15 },
  textarea: { minHeight: 70, textAlignVertical: 'top', marginBottom: 16 },
  resumen: { backgroundColor: '#f9fafb', borderRadius: 10, padding: 14, marginBottom: 16 },
  estadoTexto: { color: '#374151', fontSize: 13, marginBottom: 8 },
  filaTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: '#6b7280', fontSize: 13 },
  totalValor: { fontWeight: '800', fontSize: 20, color: '#111827' },
  renglonFila: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  renglonNombre: { color: '#111827', fontSize: 13, flex: 1, marginRight: 8 },
  renglonSubtotal: { color: '#111827', fontSize: 13, fontWeight: '600' },
  switchFila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  switchLabel: { fontSize: 14, color: '#111827' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  chipActivo: { backgroundColor: '#111827', borderColor: '#111827' },
  chipTexto: { color: '#111827', fontSize: 13 },
  chipTextoActivo: { color: '#fff', fontWeight: '600' },
  botonPrimario: { backgroundColor: '#111827', borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  botonDeshabilitado: { opacity: 0.5 },
  botonTexto: { color: '#fff', fontWeight: '700' },
  botonSecundario: { borderWidth: 1, borderColor: '#111827', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  botonSecundarioTexto: { color: '#111827', fontWeight: '600' },
  avisoTotal: { color: '#b45309', fontSize: 12, marginTop: 8, textAlign: 'center' },
  sugerencia: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
    gap: 10,
  },
  sugerenciaTitulo: { color: '#15803d', fontSize: 12, fontWeight: '600' },
  sugerenciaMonto: { color: '#111827', fontSize: 17, fontWeight: '800', marginTop: 2 },
  sugerenciaBoton: { backgroundColor: '#15803d', borderRadius: 8, paddingVertical: 9, paddingHorizontal: 14 },
  sugerenciaBotonTexto: { color: '#fff', fontWeight: '700', fontSize: 12 },
});
