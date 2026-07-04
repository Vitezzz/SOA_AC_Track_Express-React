import {
    selectRutas, selectRutasById, selectRutasByTecnico, insertRutas,
    updateRutas, deleteRutas
} from "../models/rutas.js";
import { puedeVerTodo } from "../utils/roleUtils.js";
import { selectTecnicoById } from "../models/tecnicos.js";
import { getTecnicoIdByUserId } from '../utils/lookupUtils.js'
import { listaEquipos } from "./equiposController.js";

const getRutas = async (req, res) => {
    try {

        let listaRutas;

        if (puedeVerTodo(req.user.rol_id)) {
            listaRutas = await selectRutas();
        } else if (req.user.rol_id === 4) {
            const tec_id = await getTecnicoIdByUserId(req.user.id);
            if(!tec_id) return res.status(404).json({ message : 'Tecnico no encontrado'});
            listaRutas = await selectRutasByTecnico(tec_id)
        } else {
            return res.status(403).json({ message: 'No tienes acceso' });
        }

        if (listaRutas.length === 0) {
            return res.status(400).json({ message: "Lista de Rutas no encontrada" })
        }

        res.status(200).json(listaRutas)

    } catch (error) {
        console.error('Error', error);
        return res.status(500).json({ message: "Error del servidor" })
    }
}

const getRutasById = async (req, res) => {
    try {

        const { id } = req.params;

        if (!id) {
            return res.status(404).json({ message: "Id no encontrado" })
        }

        const rutasId = await selectRutasById(id);

        if (!rutasId) {
            return res.status(404).json({ message: "Ruta no encontrada" })
        }

        res.status(200).json(rutasId);

    } catch (error) {
        console.error('Error', error);
        return res.status(500).json({ message: "Error del servidor" })
    }
}

const postRutas = async (req, res) => {
    try {

        const { fecha_ruta, estado = "pendiente", tecnico_id } = req.body;

        if (!fecha_ruta) return res.status(400).json({ message: "Fecha requerida" })

        const tecnicoExiste = await selectTecnicoById(tecnico_id);
        if (!tecnicoExiste) return res.status(404).json({ message: 'Tecnico no encontrado' })


        const nuevaRuta = await insertRutas({ fecha_ruta, estado, tecnico_id });

        res.status(201).json({
            id: nuevaRuta.id,
            tecnico_id: nuevaRuta.tecnico_id,
            fecha_ruta: nuevaRuta.fecha_ruta,
            estado: nuevaRuta.estado
        })

    } catch (error) {
        console.error('Error', error);
        return res.status(500).json({ message: "Error del servidor" })
    }
}

const putRutas = async (req, res) => {
    try {

        const { id } = req.params;

        const { fecha_ruta, estado, tecnico_id } = req.body;

        if (!id) return res.status(404).json({ message: "Id no encontrado" })

        const tecnicoExiste = await selectTecnicoById(tecnico_id);
        if (!tecnicoExiste) return res.status(404).json({ message: 'Tecnico no encontrado' })

        const rutaId = await updateRutas(id, { fecha_ruta, estado, tecnico_id })

        if (!rutaId) return res.status(404).json({ message: "Ruta no encontrada" })

        res.status(200).json({
            id: rutaId.id,
            tecnico_id: rutaId.tecnico_id,
            fecha_ruta: rutaId.fecha_ruta,
            estado: rutaId.estado
        })

    } catch (error) {
        console.error('Error', error);
        return res.status(500).json({ message: "Error del servidor" })
    }
}

const dltRutas = async (req, res) => {
    try {

        const { id } = req.params;

        if (!id) return res.status(404).json({ message: "Id no encontrado" })

        const rutaDlt = await deleteRutas(id);

        if (!rutaDlt) return res.status(404).json({ message: "Ruta no encontrada" });

        res.status(200).json(rutaDlt);
    } catch (error) {
        console.error('Error', error);
        return res.status(500).json({ message: "Error del servidor" })
    }

}

export { getRutas, getRutasById, postRutas, putRutas, dltRutas }