import {
    selectMantenimientoPreventivo, selectMantenimientoById,
    selectMantenimientoPreventivoByCliente,
    insertMantenimientoPreventivo, updateMantenimientoPreventivo,
    deleteMantenimientoPreventivo
} from "../models/mantenimientoPreventivo.js";
import { puedeVerTodo } from "../utils/roleUtils.js";
import { getClienteById } from "../models/clientes.js";
import { getEquipoById } from "../models/equipos.js";
import { getClienteIdByUserId } from '../utils/lookupUtils.js'

const getMantenimientoPreventivo = async (req, res) => {
    try {

        let listaMantenimientoPreventivo;

        if (puedeVerTodo(req.user.rol_id)) {
            listaMantenimientoPreventivo = await selectMantenimientoPreventivo();
        } else if (req.user.rol_id === 3) {
            const cli_id = await getClienteIdByUserId(req.user.id);
            if(!cli_id) return res.status(404).json({ message: 'Cliente no encontrado'});
            listaMantenimientoPreventivo = await selectMantenimientoPreventivoByCliente(cli_id);
        } else {
            return res.status(403).json({ message: 'No tienes acceso' });
        }

        if (listaMantenimientoPreventivo.length === 0) {
            return res.status(404).json({ message: "Lista de mantenimiento preventivo no encontrada" })
        }

        res.status(200).json(listaMantenimientoPreventivo);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: "Error del servidor" })
    }
}

const getMantenimientoPreventivoById = async (req, res) => {
    try {

        const { id } = req.params;

        if (!id) {
            return res.status(404).json({ message: "Id no encontrado" })
        }

        const mantenimientoPreventivoId = await selectMantenimientoById(id);

        if (!mantenimientoPreventivoId) {
            return res.status(404).json({ message: "Id de mantenimiento preventivo no encontrado" });
        }

        res.status(200).json(mantenimientoPreventivoId)

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: "Error del servidor" })
    }
}

const postMantenimientoPreventivo = async (req, res) => {
    try {

        const { cli_id, equ_id, frecuencia_dias, proxima_fecha, activo = true } = req.body;

        if (!cli_id || !frecuencia_dias || !proxima_fecha) {
            return res.status(400).json({ message: "Campos no encontrados" })
        }

        const clienteExiste = await getClienteById(cli_id);
        if (!clienteExiste) return res.status(404).json({ message: 'Cliente no encontrado' })

        const equipoExiste = await getEquipoById(equ_id);
        if (!equipoExiste) return res.status(404).json({ message: 'Equipo no encontrado' })

        const nuevoMantenimientoPreventivo = await insertMantenimientoPreventivo({ cli_id, equ_id, frecuencia_dias, proxima_fecha, activo });

        res.status(201).json({
            id: nuevoMantenimientoPreventivo.id,
            cli_id: nuevoMantenimientoPreventivo.cli_id,
            equ_id: nuevoMantenimientoPreventivo.equ_id,
            frecuencia_dias: nuevoMantenimientoPreventivo.frecuencia_dias,
            proxima_fecha: nuevoMantenimientoPreventivo.proxima_fecha,
            activo: nuevoMantenimientoPreventivo.activo
        })

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: "Error del servidor" })
    }
}

const putMantenimientoPreventivo = async (req, res) => {
    try {

        const { id } = req.params;

        const { cli_id, equ_id, frecuencia_dias, proxima_fecha, activo } = req.body;

        if (!id) {
            return res.status(404).json({ message: "Id no encontrado" })
        }


        const clienteExiste = await getClienteById(cli_id);
        if (!clienteExiste) return res.status(404).json({ message: 'Cliente no encontrado' })

        const equipoExiste = await getEquipoById(equ_id);
        if (!equipoExiste) return res.status(404).json({ message: 'Equipo no encontrado' })

        const mantenimientoPreventivoUpdt = await updateMantenimientoPreventivo(id, { cli_id, equ_id, frecuencia_dias, proxima_fecha, activo })

        if (!mantenimientoPreventivoUpdt) {
            return res.status(404).json({ message: "Mantenimiento preventivo no encontrado" });
        }

        res.status(200).json({
            id: mantenimientoPreventivoUpdt.id,
            cli_id: mantenimientoPreventivoUpdt.cli_id,
            equ_id: mantenimientoPreventivoUpdt.equ_id,
            frecuencia_dias: mantenimientoPreventivoUpdt.frecuencia_dias,
            proxima_fecha: mantenimientoPreventivoUpdt.proxima_fecha,
            activo: mantenimientoPreventivoUpdt.activo
        })

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: "Error del servidor" })
    }
}

const dltMantenimientoPreventivo = async (req, res) => {
    try {

        const { id } = req.params;

        if (!id) {
            return res.status(404).json({ message: "Id no encontrado" })
        }

        const mantenimientoPreventivoDlt = await deleteMantenimientoPreventivo(id);

        if (!mantenimientoPreventivoDlt) {
            return res.status(404).json({ message: "Mantenimiento preventivo no encontrado para eliminar" });
        }

        res.status(200).json(mantenimientoPreventivoDlt);

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: "Error del servidor" })
    }
}

export {
    getMantenimientoPreventivo, getMantenimientoPreventivoById, postMantenimientoPreventivo,
    putMantenimientoPreventivo, dltMantenimientoPreventivo
}


