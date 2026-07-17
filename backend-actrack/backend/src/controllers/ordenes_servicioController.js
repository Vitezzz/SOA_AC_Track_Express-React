import {
    selectOrdenesServicio, selectOrdenesServicioById, selectOrdenesByCliente, insertOrdenesServicio, selectOrdenesByTecnico,
    updateOrdenesServicio, deleteOrdenesServicio, generarSiguienteFolio
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

        res.status(200).json(ordenServicioId);
    } catch (error) {
        console.error("Error: ", error)
        res.status(500).json({ message: "Error del servidor" })
    }
}

const postOrdenesServicio = async (req, res) => {
    try {
        const { equ_id, cat_id, pri_id,
            prioridad, estatus, descripcion, fecha_programada, fecha_cierre, tec_id } = req.body;

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
        }

        if (equ_id) {
            const equipoExiste = await getEquipoById(equ_id);
            if (!equipoExiste) return res.status(404).json({ message: 'Equipo no encontrado' });

        }

        const folio = await generarSiguienteFolio();

        const nuevaOrdenServicio = await insertOrdenesServicio({
            cli_id, equ_id, cat_id, pri_id, folio,
            prioridad, estatus, descripcion, fecha_programada, fecha_cierre,
            tec_id
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

        await insertBitacoraEstados({
            ord_id: nuevaOrdenServicio.id,
            usu_id: req.user.id,
            estado_anterior: null,
            estado_nuevo: nuevaOrdenServicio.estatus
        })

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
            fecha_cierre: nuevaOrdenServicio.fecha_cierre
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
            tec_id } = req.body;

        if (!id) {
            return res.status(400).json({ message: 'Id no encontrado' })
        }

        const categoriaServicioExiste = await getCategoriaServicioId(cat_id);
        if (!categoriaServicioExiste) return res.status(404).json({ message: 'Categoria servicio no encontrada' });

        const prioridadExiste = await selectPrioridadById(pri_id);
        if (!prioridadExiste) return res.status(404).json({ message: 'Prioridad no encontrada' });

        const ordenAnterior = await selectOrdenesServicioById(id);

        const actualizadaOrdenServicio = await updateOrdenesServicio(id, {
            cli_id, equ_id, cat_id, pri_id, folio,
            prioridad, estatus, descripcion, fecha_programada, fecha_cierre,
            tec_id
        });

        if (tec_id) {
            const tecnico = await selectTecnicoById(tec_id);
            if (tecnico) {
                await insertNotificaciones({
                    usu_id: tecnico.usu_id,
                    tipo: 'cambio_estatus',
                    titulo: `Nueva orden ${folio} asignada`,
                    leido: false
                })
            }
        }

        const cliente = await getClienteById(cli_id);
        if (cliente && cliente.usu_id) {
            await insertNotificaciones({
                usu_id: cliente.usu_id,
                tipo: "cambio_estatus",
                titulo: `Orden ${folio} creada`,
                leido: false
            })
        }

        if (ordenAnterior && ordenAnterior.estatus !== actualizadaOrdenServicio.estatus) {
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
                fecha_cierre: actualizadaOrdenServicio.fecha_cierre
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

export { getOrdenesServicio, getOrdenesServicioById, postOrdenesServicio, putOrdenesServicio, dltOrdenesServicio }