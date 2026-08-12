import {
    selectBitacoraEstados, selectBitacoraEstadosById,
    insertBitacoraEstados, selectBitacoraPorOrden
} from "../models/bitacora_estados.js";
import { selectOrdenesServicioById, updateOrdenesServicio } from "../models/ordenes_servicio.js";
import { findUserById } from "../models/usuarios.js";
import { getClienteIdByUserId } from "../utils/lookupUtils.js";
import { enviarPush } from '../utils/pushService.js';
import { getClienteById } from '../models/clientes.js';
import { recalcularRetrasoRuta } from '../services/retrasoService.js';



const getBitacoraEstados = async (req, res) => {
    try {

        const listaBitacoraEstados = await selectBitacoraEstados();

        if (!listaBitacoraEstados) {
            return res.status(400).json({ message: "Listado de bitacora estados no encontrado" })
        }

        res.status(200).json(listaBitacoraEstados)
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ message: "Error del servidor" })
    }
}

const getBitacoraEstadosById = async (req, res) => {
    try {

        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Id no encontrado" })
        }

        const bitacoraEstadosId = await selectBitacoraEstadosById(id);

        if (!bitacoraEstadosId) {
            return res.status(404).json({ message: "Id de bitacora estados no encontrado" });
        }

        res.status(200).json(bitacoraEstadosId)
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ message: "Error del servidor" })
    }
}

const postBitacoraEstados = async (req, res) => {
    try {

        const { ord_id, usu_id, estado_anterior, estado_nuevo } = req.body;

        if (!ord_id || !usu_id || !estado_nuevo) {
            return res.status(400).json({ message: "Campos faltantes" })
        }

        const ordenExiste = await selectOrdenesServicioById(ord_id);
        if (!ordenExiste) return res.status(400).json({ message: 'Orden no encontrada' });

        const usuarioExiste = await findUserById(usu_id);
        if (!usuarioExiste) return res.status(400).json({ message: 'Usuario no encontrado' })

        const nuevoBitacoraEstado = await insertBitacoraEstados({ ord_id, usu_id, estado_anterior, estado_nuevo })

        // Si es uno de los eventos de seguimiento del técnico, avisamos
        // al cliente por push -- sin bloquear la respuesta si algo falla.
        if (estado_nuevo === 'tecnico_en_camino' || estado_nuevo === 'tecnico_llego') {
            const orden = await selectOrdenesServicioById(ord_id);
            if (orden) {
                const cliente = await getClienteById(orden.cli_id);
                if (cliente && cliente.usu_id) {
                    const titulo = estado_nuevo === 'tecnico_en_camino'
                        ? ' Tu técnico va en camino'
                        : ' Tu técnico ha llegado';
                    const cuerpo = `Orden ${orden.folio}`;
                    await enviarPush(cliente.usu_id, titulo, cuerpo);
                }

                // El momento real en que arranca el trabajo es cuando el
                // técnico llega, no cuando alguien se acuerde de tocar un
                // select -- así el estatus de la orden avanza solo, sin que
                // el admin tenga que "inventarlo" a mano. Solo aplica si
                // seguía en pendiente (si ya se movió por otro lado, no la
                // pisamos).
                if (estado_nuevo === 'tecnico_llego' && orden.estatus === 'pendiente') {
                    await updateOrdenesServicio(ord_id, {
                        cli_id: orden.cli_id, equ_id: orden.equ_id, cat_id: orden.cat_id,
                        pri_id: orden.pri_id, folio: orden.folio, prioridad: orden.prioridad,
                        estatus: 'en_proceso', descripcion: orden.descripcion,
                        fecha_programada: orden.fecha_programada, fecha_cierre: orden.fecha_cierre,
                        tec_id: orden.tec_id, duracion_estimada_horas: orden.duracion_estimada_horas
                    });
                    await insertBitacoraEstados({
                        ord_id, usu_id, estado_anterior: 'pendiente', estado_nuevo: 'en_proceso'
                    });
                }

                // Si llegó tarde, recorre las paradas que siguen ese día y
                // avisa a esos clientes -- ver retrasoService.js.
                if (estado_nuevo === 'tecnico_llego') {
                    await recalcularRetrasoRuta(ord_id);
                }
            }
        }

        res.status(201).json({
            id: nuevoBitacoraEstado.id,
            ord_id: nuevoBitacoraEstado.ord_id,
            usu_id: nuevoBitacoraEstado.usu_id,
            estado_anterior: nuevoBitacoraEstado.estado_anterior,
            estado_nuevo: nuevoBitacoraEstado.estado_nuevo
        })

    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ message: "Error del servidor" })
    }
}

const getBitacoraPorOrden = async (req, res) => {
    try {
        const { ord_id } = req.params;

        const orden = await selectOrdenesServicioById(ord_id);
        if (!orden) return res.status(404).json({ message: "Orden no encontrada" });

        // Si es cliente, solo puede ver la bitácora de SU PROPIA orden --
        // nunca la de otro cliente, aunque adivine el ord_id en la URL.
        if (req.user.rol_id === 3) {
            const cli_id = await getClienteIdByUserId(req.user.id);
            if (!cli_id || orden.cli_id !== cli_id) {
                return res.status(403).json({ message: "No tienes acceso a esta orden" });
            }
        }

        const historial = await selectBitacoraPorOrden(ord_id);
        res.status(200).json(historial);
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ message: "Error del servidor" });
    }
}

export { getBitacoraEstados, getBitacoraEstadosById, postBitacoraEstados, getBitacoraPorOrden }