import {
    selectRutaParadasByRutaId, insertRutaParadas,
    updateRutaParadas, deleteRutaParadas
} from "../models/rutaParadas.js";

const getRutaParadasByRutaId = async (req, res) => {
    try {

        const { rut_id } = req.params;

        if (!rut_id) return res.status(404).json({ message: "Id de ruta no encontrado" });

        const rutaParadaRutaId = await selectRutaParadasByRutaId(rut_id);

        if (rutaParadaRutaId.length === 0) return res.status(404).json({ message: "Ruta parada de ruta Id no encontrada" })

        res.status(200).json(rutaParadaRutaId);
    } catch (error) {
        console.error('Error : ', error);
        return res.status(500).json({ message: "Error del servidor" })
    }

}

const postRutaParadas = async (req, res) => {
    try {

        const { rut_id, ord_id, posicion, hora_estimada, estado = "pendiente" } = req.body;

        if (!rut_id || !ord_id || !posicion || !hora_estimada) return res.status(400).json({ message: "Campos faltantes" });

        const nuevaRutaParada = await insertRutaParadas({ rut_id, ord_id, posicion, hora_estimada, estado });

        res.status(201).json({
            id: nuevaRutaParada.id,
            rut_id: nuevaRutaParada.rut_id,
            ord_id: nuevaRutaParada.ord_id,
            posicion: nuevaRutaParada.posicion,
            hora_estimada: nuevaRutaParada.hora_estimada
        })

    } catch (error) {
        console.error('Error : ', error);
        return res.status(500).json({ message: "Error del servidor" })
    }
}

const putRutaParadas = async (req, res) => {
    try {

        const { id } = req.params;

        const { rut_id, ord_id, posicion, hora_estimada, estado } = req.body;

        if (!id) return res.status(404).json({ message: "Id no encontrada" });

        const rutaParadaUpdt = await updateRutaParadas(id, { rut_id, ord_id, posicion, hora_estimada, estado });

        if (!rutaParadaUpdt) return res.status(404).json({ message: "Ruta parada no encontrada" });

        res.status(200).json(rutaParadaUpdt);

    } catch (error) {
        console.error('Error : ', error);
        return res.status(500).json({ message: "Error del servidor" })
    }
}

const dltRutaParadas = async (req, res) => {
    try {

        const { id } = req.params;

        if(!id) return res.status(404).json({ message : "Id no encontrada"});

        const rutaParadaDlt = await deleteRutaParadas(id);

        if(!rutaParadaDlt) return res.status(404).json({ message : "Ruta parada no encontrada"});

        res.status(200).json(rutaParadaDlt)
    } catch (error) {
        console.error('Error : ', error);
        return res.status(500).json({ message: "Error del servidor" })
    }
}

export { getRutaParadasByRutaId, postRutaParadas, putRutaParadas, dltRutaParadas}