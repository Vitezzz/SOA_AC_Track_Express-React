import bcrypt from 'bcryptjs';
import { findUserById, findUserByEmail, updateUsuario, selectTodosUsuarios, updateActivoUsuario, createUser } from '../models/usuarios.js';
import { ROLES } from '../utils/roleUtils.js';

// Autoservicio -- siempre sobre req.user.id, nunca sobre un :id de la URL,
// así nadie puede editar los datos de otro usuario aunque adivine su id.
const getMiPerfil = async (req, res) => {
    try {
        const usuario = await findUserById(req.user.id);
        if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.status(200).json(usuario);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
}

const putMiPerfil = async (req, res) => {
    try {
        const { nombre, paterno, materno, email } = req.body;

        if (!nombre || !email) {
            return res.status(400).json({ message: 'Campos faltantes' });
        }

        const actualizado = await updateUsuario(req.user.id, { nombre, paterno, materno, email });
        res.status(200).json(actualizado);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
}

// A diferencia de putMiPerfil, aquí SÍ se recibe el id por la URL -- es la
// ruta que usa un admin para corregir datos de identidad de OTRO usuario
// (por ejemplo desde "Editar Técnico"). Solo nombre/apellidos/email: la
// contraseña y el rol se manejan aparte, no en esta pantalla.
const putUsuarioPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, paterno, materno, email } = req.body;

        if (!nombre || !email) {
            return res.status(400).json({ message: 'Campos faltantes' });
        }

        const usuarioExiste = await findUserById(id);
        if (!usuarioExiste) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const actualizado = await updateUsuario(id, { nombre, paterno, materno, email });
        res.status(200).json(actualizado);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
}

// Configuración > Usuarios -- admin ve la lista completa para poder crear
// cuentas de admin/supervisor (no hay otra forma de hacerlo: el registro
// público solo crea clientes, y "Nuevo Técnico" crea su propio usuario+
// tecnico juntos).
const getUsuarios = async (req, res) => {
    try {
        const usuarios = await selectTodosUsuarios();
        res.status(200).json(usuarios);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
}

// Solo para admin/supervisor -- crear un cliente ya tiene su propio flujo
// (registro público) y crear un técnico también (POST /api/tecnicos, que
// arma usuario+tecnico en una sola transacción). Esta ruta es nada más
// para las dos cuentas que no tienen ningún otro lugar donde nacer.
const postUsuario = async (req, res) => {
    try {
        const { nombre, paterno, materno, email, password, rol_id } = req.body;

        if (!nombre || !email || !password || !rol_id) {
            return res.status(400).json({ message: 'Campos faltantes' });
        }

        if (![ROLES.ADMIN, ROLES.SUPERVISOR].includes(Number(rol_id))) {
            return res.status(400).json({ message: 'Esta pantalla solo crea cuentas de admin o supervisor' });
        }

        const yaExiste = await findUserByEmail(email);
        if (yaExiste) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const nuevoUsuario = await createUser({
            nombre, email, password: passwordHash, rol_id: Number(rol_id), paterno, materno,
        });

        res.status(201).json(nuevoUsuario);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
}

const putActivoUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { activo } = req.body;

        if (typeof activo !== 'boolean') {
            return res.status(400).json({ message: 'Campo "activo" faltante o inválido' });
        }

        const usuarioExiste = await findUserById(id);
        if (!usuarioExiste) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        if (Number(id) === req.user.id) {
            return res.status(400).json({ message: 'No puedes desactivar tu propia cuenta' });
        }

        const actualizado = await updateActivoUsuario(id, activo);
        res.status(200).json(actualizado);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
}

export { getMiPerfil, putMiPerfil, putUsuarioPorId, getUsuarios, postUsuario, putActivoUsuario };
