import {
    selectNotificaciones, selectNotificacionesById,
    insertNotificaciones, updateNotificaciones, deleteNotificaciones
} from "../models/notificaciones.js";
import { findUserById } from "../models/usuarios.js";

const getNotificaciones = async (req, res) => {
    try {

        const listaNotificaciones = await selectNotificaciones();

        if (listaNotificaciones.length === 0) {
            return res.status(404).json({ message: "Lista de notificaciones no encontrada" });
        }

        res.status(200).json(listaNotificaciones);

    } catch (error) {
        console.error('Error: ', error);
        res.status(500).json({ message: "Error del servidor" })
    }
}

const getNotificacionesById = async (req, res) => {
    try {

        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Id no encontrado" });
        }

        const notificacionId = await selectNotificacionesById(id);

        if (!notificacionId) {
            return res.status(404).json({ message: "Notificacion no encontrada" })
        }

        res.status(200).json(notificacionId)

    } catch (error) {
        console.error('Error: ', error);
        res.status(500).json({ message: "Error del servidor" })
    }
}

const postNotificaciones = async (req, res) => {
    try {

        const { usu_id, tipo, titulo, leido } = req.body;

        if (!usu_id || !tipo || !titulo || leido === null || leido === undefined) {
            return res.status(400).json({ message: "Campos faltantes" })
        }

        const usuarioExiste = await findUserById(usu_id)
        if (!usuarioExiste) return res.status(404).json({ message: 'Usuario no encontrado' });

        const nuevaNotificacion = await insertNotificaciones({ usu_id, tipo, titulo, leido });

        return res.status(201).json({
            id: nuevaNotificacion.id,
            usu_id: nuevaNotificacion.usu_id,
            tipo: nuevaNotificacion.tipo,
            titulo: nuevaNotificacion.titulo,
            leido: nuevaNotificacion.leido
        })
    } catch (error) {
        console.error('Error: ', error);
        res.status(500).json({ message: "Error del servidor" })
    }
}

const putNotificaciones = async (req, res) => {
    try {

        const { id } = req.params;

        const { usu_id, tipo, titulo, leido } = req.body;

        if (!id) {
            return res.status(400).json({ message: "Id no encontrado" })
        }

        const usuarioExiste = await findUserById(usu_id)
        if (!usuarioExiste) return res.status(404).json({ message: 'Usuario no encontrado' });

        const notificacionUpdt = await updateNotificaciones(id, { usu_id, tipo, titulo, leido });

        if (!notificacionUpdt) {
            return res.status(404).json({ message: "Notificacion no encontrada" });
        }

        res.status(200).json({
            id: notificacionUpdt.id,
            usu_id: notificacionUpdt.usu_id,
            tipo: notificacionUpdt.tipo,
            titulo: notificacionUpdt.titulo,
            leido: notificacionUpdt.leido
        })

    } catch (error) {
        console.error('Error: ', error);
        res.status(500).json({ message: "Error del servidor" })
    }
}

const dltNotificaciones = async (req, res) => {
    try {

        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Id no encontrado" });
        }

        const notificacionDlt = await deleteNotificaciones(id);

        if (!notificacionDlt) {
            return res.status(404).json({ message: "Notificacion no encontrada" });
        }

        res.status(200).json(notificacionDlt);

    } catch (error) {
        console.error('Error: ', error);
        res.status(500).json({ message: "Error del servidor" })
    }
}

export {
    getNotificaciones, getNotificacionesById, postNotificaciones,
    putNotificaciones, dltNotificaciones
}