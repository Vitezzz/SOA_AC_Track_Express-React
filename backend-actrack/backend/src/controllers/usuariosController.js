import { findUserById, updateUsuario } from '../models/usuarios.js';

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

export { getMiPerfil, putMiPerfil, putUsuarioPorId };
