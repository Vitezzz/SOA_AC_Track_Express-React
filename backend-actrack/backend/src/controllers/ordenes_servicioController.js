import {
    selectOrdenesServicio, selectOrdenesServicioById, insertOrdenesServicio,
    updateOrdenesServicio, deleteOrdenesServicio
} from "../models/ordenes_servicio.js";

const getOrdenesServicio = async (req, res) => {
    try {
        const listaOrdenesServicio = await selectOrdenesServicio();
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
        const { cli_id, equ_id, cat_id, pri_id, folio,
            prioridad, estatus, descripcion, fecha_programada, fecha_cierre } = req.body;

        const nuevaOrdenServicio = await insertOrdenesServicio({
            cli_id, equ_id, cat_id, pri_id, folio,
            prioridad, estatus, descripcion, fecha_programada, fecha_cierre
        })

        res.status(201).json({
            id: nuevaOrdenServicio.id,
            cli_id: nuevaOrdenServicio.cli_id,
            equ_id: nuevaOrdenServicio.equ_id,
            cat_id: nuevaOrdenServicio.cat_id,
            pri_id: nuevaOrdenServicio.pri_id,
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
            prioridad, estatus, descripcion, fecha_programada, fecha_cierre } = req.body;

        if (!id) {
            return res.status(400).json({ message: 'Id no encontrado' })
        }

        const actualizadaOrdenServicio = await updateOrdenesServicio(id, {
            cli_id, equ_id, cat_id, pri_id, folio,
            prioridad, estatus, descripcion, fecha_programada, fecha_cierre
        });

        res.status(200).json(
            {
                id: actualizadaOrdenServicio.id,
                cli_id: actualizadaOrdenServicio.cli_id,
                equ_id: actualizadaOrdenServicio.equ_id,
                cat_id: actualizadaOrdenServicio.cat_id,
                pri_id: actualizadaOrdenServicio.pri_id,
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

        if(!id){
            return res.status(400).json({ message: "Id no encontrada"})
        }

        const ordenServicioId = await deleteOrdenesServicio(id);

        if(!ordenServicioId){
            return res.status(404).json({ message: "Id de orden servicio no encontrado"})
        }

        return res.status(200).json(ordenServicioId)
    } catch (error) {
        console.error("Error: ", error)
        res.status(500).json({ message: "Error del servidor" })
    }
}

export { getOrdenesServicio, getOrdenesServicioById, postOrdenesServicio, putOrdenesServicio, dltOrdenesServicio}