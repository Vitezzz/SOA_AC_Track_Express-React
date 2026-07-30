import {
    selectTecnicos, selectTecnicosTodos, selectTecnicoById, insertTecnicos, updateTecnicos,
    deleteTecnicos, selectTecnicosConDisponibilidad
} from "../models/tecnicos.js";
import { findUserById, findUserByEmail } from "../models/usuarios.js";
import { selectEspecialidadById } from "../models/especialidad.js";
import pool from "../config/database.js";
import bcrypt from "bcryptjs";

const getTecnicos = async (req, res) => {
    try {
        const listaTecnicos = await selectTecnicos();

        if (listaTecnicos.length === 0) {
            return res.status(404).json({ message: "Lista de tecnicos no encontrada" })
        }

        res.status(200).json(listaTecnicos);
    } catch (error) {
        console.error("Error:", error)
        res.status(500).json({ message: "Error del servidor" })
    }
}

const getTecnicosById = async (req, res) => {
    try {

        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Id no encontrado" })
        }

        const tecnicoId = await selectTecnicoById(id);

        if (!tecnicoId) {
            return res.status(404).json({ message: "Id no encontrado" })
        }

        res.status(200).json(tecnicoId)

    } catch (error) {
        console.error("Error:", error)
        res.status(500).json({ message: "Error del servidor" })
    }
}

const postTecnicos = async (req, res) => {
    const { nombre, paterno, materno, email, password, esp_id } = req.body;

    if (!nombre || !email || !password || !esp_id) {
        return res.status(400).json({ message: "Campos faltantes" });
    }

    const especialidadExiste = await selectEspecialidadById(esp_id);
    if (!especialidadExiste) return res.status(404).json({ message: "Especialidad no encontrada" });

    const usuarioExiste = await findUserByEmail(email);
    if (usuarioExiste) return res.status(400).json({ message: "El email ya está registrado" });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const resultUsuario = await client.query(
            `INSERT INTO usuarios (rol_id, nombre, paterno, materno, email, password)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, nombre, email`,
            [4, nombre, paterno, materno, email, passwordHash]
        );
        const nuevoUsuario = resultUsuario.rows[0];

        const resultTecnico = await client.query(
            `INSERT INTO tecnicos (usu_id, esp_id, disponible) VALUES ($1, $2, true) RETURNING *`,
            [nuevoUsuario.id, esp_id]
        );

        await client.query('COMMIT');

        res.status(201).json({
            ...resultTecnico.rows[0],
            nombre: nuevoUsuario.nombre,
            email: nuevoUsuario.email,
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error:", error);
        res.status(500).json({ message: "Error del servidor" });
    } finally {
        client.release();
    }
}

const putTecnicos = async (req, res) => {
    try {

        const { id } = req.params;
        const { usu_id, esp_id, disponible } = req.body;
        if (!id) {
            return res.status(400).json({ message: "Id no encontrado" })
        }


        const usuarioExiste = await findUserById(usu_id);
        if (!usuarioExiste) return res.status(404).json({ message: 'Usuario no encontrado' });

        const especialidadExiste = await selectEspecialidadById(esp_id);
        if (!especialidadExiste) return res.status(404).json({ message: 'Especialidad no encontrada' })

        const updtTecnico = await updateTecnicos(id, { usu_id, esp_id, disponible });

        return res.status(200).json({
            id: updtTecnico.id,
            usu_id: updtTecnico.usu_id,
            esp_id: updtTecnico.esp_id,
            disponible: updtTecnico.disponible
        })
    } catch (error) {
        console.error("Error:", error)
        res.status(500).json({ message: "Error del servidor" })
    }
}

const dltTecnicos = async (req, res) => {
    try {

        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Id no encontrado" })
        }

        const tecnicoDelete = await deleteTecnicos(id);

        if (!tecnicoDelete) {
            return res.status(404).json({ message: "Id de tecnico no encontrado" })
        }

        return res.status(200).json(tecnicoDelete)

    } catch (error) {
        console.error("Error:", error)
        res.status(500).json({ message: "Error del servidor" })
    }
}

const getTecnicosTodos = async (req, res) => {
    try {
        const listaTecnicos = await selectTecnicosTodos();

        if (listaTecnicos.length === 0) {
            return res.status(404).json({ message: "Lista de tecnicos no encontrada" });
        }

        res.status(200).json(listaTecnicos);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Error del servidor" });
    }
}

const getDisponibilidadTecnicos = async (req, res) => {
    try {
        const { fecha, excluir } = req.query;
        if (!fecha) return res.status(400).json({ message: "Falta la fecha a consultar" });

        const tecnicos = await selectTecnicosConDisponibilidad(fecha, excluir || null);
        res.status(200).json(tecnicos);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Error del servidor" });
    }
}

export { getTecnicos, getTecnicosTodos, getTecnicosById, postTecnicos, putTecnicos, dltTecnicos, getDisponibilidadTecnicos }