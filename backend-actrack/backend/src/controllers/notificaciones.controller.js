import {
    selectNotificaciones, selectNotificacionesById, selectNotificacionesByUsuario,
    insertNotificaciones, updateNotificaciones, deleteNotificaciones
} from "../models/notificaciones.js";
import { findUserById } from "../models/usuarios.js";
import { puedeVerTodo } from "../utils/roleUtils.js";

// Admin/supervisor ven todas (para soporte); cualquier otro usuario solo
// las suyas -- antes esto regresaba TODA la tabla a cualquiera con sesión.
const getNotificaciones = async (req, res) => {
    try {

        const listaNotificaciones = puedeVerTodo(req.user.rol_id)
            ? await selectNotificaciones()
            : await selectNotificacionesByUsuario(req.user.id);

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

        // Mismo criterio que la lista: no dejar leer la notificación de
        // otra persona solo por adivinar el id.
        if (!puedeVerTodo(req.user.rol_id) && notificacionId.usu_id !== req.user.id) {
            return res.status(403).json({ message: "No tienes acceso a esta notificación" });
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

        const notificacionExistente = await selectNotificacionesById(id);
        if (!notificacionExistente) {
            return res.status(404).json({ message: "Notificacion no encontrada" });
        }

        // Igual que en el GET: sin esto, cualquiera con sesión podía marcar
        // como leída (o reasignar de usu_id) la notificación de otra persona.
        if (!puedeVerTodo(req.user.rol_id) && notificacionExistente.usu_id !== req.user.id) {
            return res.status(403).json({ message: "No tienes acceso a esta notificación" });
        }

        const usuarioExiste = await findUserById(usu_id)
        if (!usuarioExiste) return res.status(404).json({ message: 'Usuario no encontrado' });

        const notificacionUpdt = await updateNotificaciones(id, { usu_id, tipo, titulo, leido });

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