import {
    selectOrdenesServicio, selectOrdenesServicioById, selectOrdenesByCliente, insertOrdenesServicio, selectOrdenesByTecnico,
    updateOrdenesServicio, deleteOrdenesServicio, generarSiguienteFolio, getOrdenesPorTecnicoEnConflicto,
    updateSolicitudCliente
} from "../models/ordenes_servicio.js";
import { insertBitacoraEstados } from "../models/bitacora_estados.js";
import { puedeVerTodo } from "../utils/roleUtils.js";
import { selectTecnicoById } from "../models/tecnicos.js";
import { insertNotificaciones } from "../models/notificaciones.js";
import { getClienteById } from "../models/clientes.js";
import { getEquipoById } from "../models/equipos.js";
import { getCategoriaServicioId } from "../models/categoria_servicio.js";
import { selectPrioridadById } from "../models/prioridad.js";
import { getClienteIdByUserId, getTecnicoIdByUserId } from '../utils/lookupUtils.js'
import { selectTodosUsuarios } from "../models/usuarios.js";
import { sincronizarRutaParada } from "../services/rutaAutoService.js";
import { enviarPush } from "../utils/pushService.js";


const getOrdenesServicio = async (req, res) => {
    try {

        let listaOrdenesServicio;

        if (puedeVerTodo(req.user.rol_id)) {
            listaOrdenesServicio = await selectOrdenesServicio();
        } else if (req.user.rol_id === 3) {
            const cli_id = await getClienteIdByUserId(req.user.id);
            if (!cli_id) return res.status(404).json({ message: 'Cliente no encontrado' });
            listaOrdenesServicio = await selectOrdenesByCliente(cli_id)
        } else if (req.user.rol_id === 4) {
            const tec_id = await getTecnicoIdByUserId(req.user.id);
            if (!tec_id) return res.status(404).json({ message: 'Tecnico no encontrado' });
            listaOrdenesServicio = await selectOrdenesByTecnico(tec_id)
        } else {
            return res.status(403).json({ message: "No tienes acceso" })
        }

        if (!listaOrdenesServicio) {
            return res.status(500).json({ message: 'Lista de ordenes servicio no encontrada' });
        }
        res.status(200).json(listaOrdenesServicio);
    } catch (error) {
        console.error("Error :", error);
        res.status(500).json({ message: "Error del servidor" })
    }
}

const getOrdenesServicioById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Id no encontrado" });
        }

        const ordenServicioId = await selectOrdenesServicioById(id);

        if (!ordenServicioId) {
            return res.status(404).json({ message: "Id de orden servicio no encontrado" });
        }

        if (req.user.rol_id === 3) {
            const cli_id = await getClienteIdByUserId(req.user.id);
            if (!cli_id || ordenServicioId.cli_id !== cli_id) {
                return res.status(403).json({ message: "No tienes acceso a esta orden" });
            }
        } else if (req.user.rol_id === 4) {
            const tec_id = await getTecnicoIdByUserId(req.user.id);
            if (!tec_id || ordenServicioId.tec_id !== tec_id) {
                return res.status(403).json({ message: "No tienes acceso a esta orden" });
            }
        }

        res.status(200).json(ordenServicioId);
    } catch (error) {
        console.error("Error: ", error)
        res.status(500).json({ message: "Error del servidor" })
    }
}

const postOrdenesServicio = async (req, res) => {
    try {
        const { equ_id, cat_id, pri_id,
            prioridad, estatus, descripcion, fecha_programada, fecha_cierre, tec_id, duracion_estimada_horas } = req.body;

        let cli_id = req.body.cli_id;

        if (req.user.rol_id === 3) {
            cli_id = await getClienteIdByUserId(req.user.id);

            if (!cli_id) return res.status(404).json({ message: 'Cliente no encontrado' })
        }

        if (!cli_id) return res.status(400).json({ message: "Campo requerido cli_id" })

        const clienteExiste = await getClienteById(cli_id);
        if (!clienteExiste) return res.status(404).json({ message: 'Cliente no encontrado' });

        const categoriaServicioExiste = await getCategoriaServicioId(cat_id);
        if (!categoriaServicioExiste) return res.status(404).json({ message: 'Categoria servicio no encontrada' });

        const prioridadExiste = await selectPrioridadById(pri_id);
        if (!prioridadExiste) return res.status(404).json({ message: 'Prioridad no encontrada' });

        if (tec_id) {
            const tecnicoExiste = await selectTecnicoById(tec_id);
            if (!tecnicoExiste) return res.status(404).json({ message: 'Tecnico no encontrado' })

            const conflictos = await getOrdenesPorTecnicoEnConflicto(tec_id, fecha_programada, duracion_estimada_horas || 2, null);
            if (conflictos.length > 0) {
                return res.status(409).json({
                    message: `Ese técnico ya tiene la orden ${conflictos[0].folio} programada en un horario que se traslapa. Elige otro horario o técnico.`
                });
            }
        }

        if (equ_id) {
            const equipoExiste = await getEquipoById(equ_id);
            if (!equipoExiste) return res.status(404).json({ message: 'Equipo no encontrado' });

        }

        const folio = await generarSiguienteFolio();

        const nuevaOrdenServicio = await insertOrdenesServicio({
            cli_id, equ_id, cat_id, pri_id, folio,
            prioridad, estatus, descripcion, fecha_programada, fecha_cierre,
            tec_id, duracion_estimada_horas: duracion_estimada_horas || 2
        })

        if (tec_id) {
            const tecnico = await selectTecnicoById(tec_id);
            if (tecnico) {
                await insertNotificaciones({
                    usu_id: tecnico.usu_id,
                    tipo: 'nueva_orden',
                    titulo: `Nueva orden ${folio} asignada`,
                    leido: false
                })
                // La notificación en la app no basta si el técnico no la
                // tiene abierta -- sin esto se enteraba hasta que se le
                // ocurriera entrar a checar.
                await enviarPush(tecnico.usu_id, 'Nueva orden asignada', `Orden ${folio}`);
            }
        }

        const cliente = await getClienteById(cli_id);
        if (cliente && cliente.usu_id) {
            await insertNotificaciones({
                usu_id: cliente.usu_id,
                tipo: "nueva_orden",
                titulo: `Orden ${folio} creada`,
                leido: false
            })
        }

        // Antes nadie de staff se enteraba de una orden nueva a menos que
        // se le ocurriera entrar a checar Gestión de Órdenes -- crítico
        // sobre todo cuando el que la crea es un CLIENTE (Solicitud de
        // Servicio) y todavía no tiene técnico asignado.
        const staff = (await selectTodosUsuarios()).filter((u) => u.rol_id === 2 || u.rol_id === 5);
        for (const persona of staff) {
            await insertNotificaciones({
                usu_id: persona.id,
                tipo: 'nueva_orden',
                titulo: tec_id ? `Nueva orden ${folio} creada` : `Nueva orden ${folio} creada -- sin técnico asignado`,
                leido: false
            })
        }

        await insertBitacoraEstados({
            ord_id: nuevaOrdenServicio.id,
            usu_id: req.user.id,
            estado_anterior: null,
            estado_nuevo: nuevaOrdenServicio.estatus
        })

        // La mete sola a la agenda del técnico ese día -- ver
        // rutaAutoService.js para por qué esto no puede quedar como
        // trabajo manual de "Planificar Ruta".
        await sincronizarRutaParada(nuevaOrdenServicio);

        res.status(201).json({
            id: nuevaOrdenServicio.id,
            cli_id: nuevaOrdenServicio.cli_id,
            equ_id: nuevaOrdenServicio.equ_id,
            cat_id: nuevaOrdenServicio.cat_id,
            pri_id: nuevaOrdenServicio.pri_id,
            tec_id: nuevaOrdenServicio.tec_id,
            folio: nuevaOrdenServicio.folio,
            prioridad: nuevaOrdenServicio.prioridad,
            estatus: nuevaOrdenServicio.estatus,
            descripcion: nuevaOrdenServicio.descripcion,
            fecha_programada: nuevaOrdenServicio.fecha_programada,
            fecha_cierre: nuevaOrdenServicio.fecha_cierre,
            duracion_estimada_horas: nuevaOrdenServicio.duracion_estimada_horas
        });
    } catch (error) {
        console.error("Error: ", error)
        res.status(500).json({ message: "Error del servidor" })
    }
}

const putOrdenesServicio = async (req, res) => {
    try {
        const { id } = req.params;
        const { cli_id, equ_id, cat_id, pri_id, folio,
            prioridad, estatus, descripcion, fecha_programada, fecha_cierre,
            tec_id, duracion_estimada_horas } = req.body;

        if (!id) {
            return res.status(400).json({ message: 'Id no encontrado' })
        }

        const categoriaServicioExiste = await getCategoriaServicioId(cat_id);
        if (!categoriaServicioExiste) return res.status(404).json({ message: 'Categoria servicio no encontrada' });

        const prioridadExiste = await selectPrioridadById(pri_id);
        if (!prioridadExiste) return res.status(404).json({ message: 'Prioridad no encontrada' });

        if (tec_id) {
            const tecnicoExiste = await selectTecnicoById(tec_id);
            if (!tecnicoExiste) return res.status(404).json({ message: 'Tecnico no encontrado' })

            const conflictos = await getOrdenesPorTecnicoEnConflicto(tec_id, fecha_programada, duracion_estimada_horas || 2, id);
            if (conflictos.length > 0) {
                return res.status(409).json({
                    message: `Ese técnico ya tiene la orden ${conflictos[0].folio} programada en un horario que se traslapa. Elige otro horario o técnico.`
                });
            }
        }

        const ordenAnterior = await selectOrdenesServicioById(id);

        const actualizadaOrdenServicio = await updateOrdenesServicio(id, {
            cli_id, equ_id, cat_id, pri_id, folio,
            prioridad, estatus, descripcion, fecha_programada, fecha_cierre,
            tec_id, duracion_estimada_horas: duracion_estimada_horas || 2
        });

        // Antes esto notificaba "nueva orden asignada" / "orden creada" en
        // CADA PUT, sin importar qué cambió -- un PUT que solo cierra el
        // servicio (mismo tec_id, reenviado tal cual) volvía a notificar al
        // técnico como si le hubieran asignado la orden de nuevo. Ahora solo
        // se notifica cuando el técnico o el estatus realmente cambiaron.
        const tecnicoCambio = tec_id && tec_id !== ordenAnterior?.tec_id;
        if (tecnicoCambio) {
            const tecnico = await selectTecnicoById(tec_id);
            if (tecnico) {
                await insertNotificaciones({
                    usu_id: tecnico.usu_id,
                    tipo: 'nueva_orden',
                    titulo: `Nueva orden ${folio} asignada`,
                    leido: false
                })
                await enviarPush(tecnico.usu_id, 'Nueva orden asignada', `Orden ${folio}`);
            }
        }

        // Se sincroniza siempre (no solo si cambió tec_id) -- también
        // cubre que solo haya cambiado fecha_programada, o que se haya
        // desasignado al técnico. La función misma es la que decide si
        // hay algo que mover -- ver rutaAutoService.js.
        await sincronizarRutaParada(actualizadaOrdenServicio);

        const estatusCambio = ordenAnterior && ordenAnterior.estatus !== actualizadaOrdenServicio.estatus;
        if (estatusCambio) {
            const cliente = await getClienteById(cli_id);
            if (cliente && cliente.usu_id) {
                await insertNotificaciones({
                    usu_id: cliente.usu_id,
                    tipo: "cambio_estatus",
                    titulo: `Orden ${folio}: ahora está ${actualizadaOrdenServicio.estatus}`,
                    leido: false
                })
            }

            await insertBitacoraEstados({
                ord_id: id,
                usu_id: req.user.id,
                estado_anterior: ordenAnterior.estatus,
                estado_nuevo: actualizadaOrdenServicio.estatus
            })
        }

        res.status(200).json(
            {
                id: actualizadaOrdenServicio.id,
                cli_id: actualizadaOrdenServicio.cli_id,
                equ_id: actualizadaOrdenServicio.equ_id,
                cat_id: actualizadaOrdenServicio.cat_id,
                pri_id: actualizadaOrdenServicio.pri_id,
                tec_id: actualizadaOrdenServicio.tec_id,
                folio: actualizadaOrdenServicio.folio,
                prioridad: actualizadaOrdenServicio.prioridad,
                estatus: actualizadaOrdenServicio.estatus,
                descripcion: actualizadaOrdenServicio.descripcion,
                fecha_programada: actualizadaOrdenServicio.fecha_programada,
                fecha_cierre: actualizadaOrdenServicio.fecha_cierre,
                duracion_estimada_horas: actualizadaOrdenServicio.duracion_estimada_horas
            }
        )

    } catch (error) {
        console.error("Error: ", error)
        res.status(500).json({ message: "Error del servidor" })
    }
}

const dltOrdenesServicio = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Id no encontrada" })
        }

        const ordenServicioId = await deleteOrdenesServicio(id);

        if (!ordenServicioId) {
            return res.status(404).json({ message: "Id de orden servicio no encontrado" })
        }

        return res.status(200).json(ordenServicioId)
    } catch (error) {
        console.error("Error: ", error)
        res.status(500).json({ message: "Error del servidor" })
    }
}

// Un cliente pide cancelar/reagendar. Si todavía no hay técnico asignado,
// no hay ruta ni nada planeado que se pueda romper -- se aplica al
// instante. En cuanto ya hay técnico, puede que ya exista una ruta armada
// para ese día, así que se queda "pendiente de revisión" hasta que un
// admin/supervisor la apruebe o rechace.
const postSolicitudCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const { tipo, fecha_nueva, motivo } = req.body;

        if (!['cancelar', 'reagendar'].includes(tipo)) {
            return res.status(400).json({ message: "Tipo de solicitud inválido" });
        }
        if (tipo === 'reagendar' && !fecha_nueva) {
            return res.status(400).json({ message: "Falta la nueva fecha" });
        }

        const cli_id = await getClienteIdByUserId(req.user.id);
        if (!cli_id) return res.status(404).json({ message: 'Cliente no encontrado' });

        const orden = await selectOrdenesServicioById(id);
        if (!orden) return res.status(404).json({ message: 'Orden no encontrada' });
        if (orden.cli_id !== cli_id) return res.status(403).json({ message: 'No tienes acceso a esta orden' });

        if (!['pendiente', 'en_proceso'].includes(orden.estatus)) {
            return res.status(400).json({ message: 'Esta orden ya no se puede cancelar ni reagendar' });
        }
        if (orden.solicitud_estado === 'pendiente') {
            return res.status(400).json({ message: 'Ya tienes una solicitud pendiente de revisión para esta orden' });
        }

        // Sin técnico asignado todavía -- se aplica directo, no hay nada
        // que un admin necesite coordinar primero.
        if (!orden.tec_id) {
            if (tipo === 'cancelar') {
                const actualizada = await updateOrdenesServicio(id, { ...orden, estatus: 'cancelada' });
                await insertBitacoraEstados({ ord_id: id, usu_id: req.user.id, estado_anterior: orden.estatus, estado_nuevo: 'cancelada' });
                return res.status(200).json({ aplicadaDeInmediato: true, orden: actualizada });
            }
            const actualizada = await updateOrdenesServicio(id, { ...orden, fecha_programada: fecha_nueva });
            return res.status(200).json({ aplicadaDeInmediato: true, orden: actualizada });
        }

        // Con técnico asignado -- queda pendiente de que staff la resuelva.
        const actualizada = await updateSolicitudCliente(id, {
            solicitud_tipo: tipo,
            solicitud_fecha_nueva: tipo === 'reagendar' ? fecha_nueva : null,
            solicitud_motivo: motivo || null,
            solicitud_estado: 'pendiente',
            solicitud_respuesta: null,
        });

        const staff = (await selectTodosUsuarios()).filter((u) => u.rol_id === 2 || u.rol_id === 5);
        for (const persona of staff) {
            await insertNotificaciones({
                usu_id: persona.id,
                tipo: 'solicitud_cliente',
                titulo: `Orden ${orden.folio}: cliente pidió ${tipo === 'cancelar' ? 'cancelar' : 'reagendar'}`,
                leido: false,
            });
        }

        res.status(200).json({ aplicadaDeInmediato: false, orden: actualizada });
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ message: "Error del servidor" });
    }
}

const putResolverSolicitud = async (req, res) => {
    try {
        const { id } = req.params;
        const { aprobar, motivo_respuesta } = req.body;

        if (typeof aprobar !== 'boolean') {
            return res.status(400).json({ message: "Falta indicar si se aprueba o rechaza" });
        }

        const orden = await selectOrdenesServicioById(id);
        if (!orden) return res.status(404).json({ message: 'Orden no encontrada' });
        if (orden.solicitud_estado !== 'pendiente') return res.status(400).json({ message: 'Esta orden no tiene una solicitud pendiente' });

        let actualizada = orden;
        if (aprobar) {
            if (orden.solicitud_tipo === 'cancelar') {
                actualizada = await updateOrdenesServicio(id, { ...orden, estatus: 'cancelada' });
                await insertBitacoraEstados({ ord_id: id, usu_id: req.user.id, estado_anterior: orden.estatus, estado_nuevo: 'cancelada' });
            } else {
                actualizada = await updateOrdenesServicio(id, { ...orden, fecha_programada: orden.solicitud_fecha_nueva });
            }
        }
        // Se conservan solicitud_tipo/fecha_nueva/motivo como registro de qué
        // se pidió -- solo cambia el estado, así el cliente sigue viendo en
        // su orden qué pasó (y por qué, si se rechazó) en vez de que
        // desaparezca en cuanto se resuelve.
        actualizada = await updateSolicitudCliente(id, {
            solicitud_tipo: orden.solicitud_tipo,
            solicitud_fecha_nueva: orden.solicitud_fecha_nueva,
            solicitud_motivo: orden.solicitud_motivo,
            solicitud_estado: aprobar ? 'aprobada' : 'rechazada',
            solicitud_respuesta: motivo_respuesta || null,
        });

        const cliente = await getClienteById(orden.cli_id);
        if (cliente?.usu_id) {
            const accion = orden.solicitud_tipo === 'cancelar' ? 'cancelación' : 'reagendado';
            const motivoTexto = !aprobar && motivo_respuesta ? ` Motivo: ${motivo_respuesta}` : '';
            await insertNotificaciones({
                usu_id: cliente.usu_id,
                tipo: 'solicitud_resuelta',
                titulo: `Tu solicitud de ${accion} para la orden ${orden.folio} fue ${aprobar ? 'aprobada' : 'rechazada'}.${motivoTexto}`,
                leido: false,
            });
        }

        res.status(200).json(actualizada);
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ message: "Error del servidor" });
    }
}

export { getOrdenesServicio, getOrdenesServicioById, postOrdenesServicio, putOrdenesServicio, dltOrdenesServicio, postSolicitudCliente, putResolverSolicitud }