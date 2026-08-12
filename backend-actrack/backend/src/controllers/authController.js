import { deleteSesiones, insertSesiones } from '../models/sesiones.js';
import { createUser, findUserByEmail } from '../models/usuarios.js'
import { cookieOptions, generateAccessToken, generateRefreshToken } from '../utils/authUtils.js'
import jwt from 'jsonwebtoken';
import { selectSesionesByToken } from '../models/sesiones.js';
import bcrypt from 'bcryptjs'
import { ROLES } from '../utils/roleUtils.js'
import pool from '../config/database.js'
import { getClienteIdByUserId } from '../utils/lookupUtils.js';
import { getClienteById } from '../models/clientes.js';
import { validarTelefonoMX } from '../utils/validaciones.js';

const register = async (req, res) => {

    // Este endpoint es público (sin "protect") a propósito -- es el registro
    // libre de clientes desde la web. Por eso el rol_id NUNCA se toma del
    // body: si se respetara lo que manda el cliente, cualquiera podría
    // registrarse como admin/supervisor/técnico mandando rol_id en el POST.
    // Admin/supervisor se crean por fuera (DB directa); técnico se crea
    // desde "Nuevo Técnico" en desktop (POST /api/tecnicos, admin-only).
    const rol_id = ROLES.CLIENTE;
    const { nombre, paterno, materno, email, password, telefono, direccion, latitud, longitud } = req.body;

    if (!nombre || !email || !password) {
        return res.status(400).json({ message: 'Favor de proporcionar todos los campos' })
    }

    //Cliente siempre necesita teléfono y dirección
    //(La tabla clientes los necesita para operar : notificar por SMS, ubicarlo, etc.)
    if (!telefono || !direccion) {
        return res.status(400).json({ message: 'Teléfono y dirección son requeridos' })
    }

    const usuarioExiste = await findUserByEmail(email)
    if (usuarioExiste) {
        return res.status(400).json({ message: "El email ya esta registrado" })
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt)

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        /*
        1.-Creamos el usuario(login) DENTRO de la transacción,
        por eso usamos una query directa con "client", no el modelo createUser
        (createUser usa el pool general, no participa en nuestra transacción)
        */

        const resultUsuario = await client.query(
            `INSERT INTO usuarios (rol_id, nombre, paterno, materno, email, password)
                VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, nombre, email`,
            [rol_id, nombre, paterno, materno, email, passwordHash]
        );

        const nuevoUsuario = resultUsuario.rows[0];

        //2) Si es cliente, creamos también su perfil en la misma transacción
        if (Number(rol_id) === ROLES.CLIENTE) {
            await client.query(
                `INSERT INTO clientes (usu_id, nombre, email, telefono, direccion, activo, latitud, longitud)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [nuevoUsuario.id, nombre, email, telefono, direccion, true, latitud || null, longitud || null]
            );
        }

        if (Number(rol_id) === ROLES.CLIENTE && !validarTelefonoMX(telefono)) {
            return res.status(400).json({ message: 'El teléfono debe tener 10 dígitos' })
        }

        await client.query('COMMIT');

        const token = generateAccessToken(nuevoUsuario.id);
        // Sin esto, el cliente recién registrado se queda sin refresh token
        // guardado -- a la hora de vida del access token se le cierra la
        // sesión de golpe, sin poder renovarla sola como sí pasa al hacer
        // login normal.
        const refreshToken = generateRefreshToken(nuevoUsuario.id);
        const expira = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await insertSesiones(nuevoUsuario.id, refreshToken, expira);

        res.cookie('token', token, cookieOptions);

        res.status(201).json({
            id: nuevoUsuario.id,
            nombre: nuevoUsuario.nombre,
            email: nuevoUsuario.email,
            accessToken: token,
            refreshToken
        })

    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ message: 'Error del servidor' });
    } finally {
        client.release();
    }

}


const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(401).json({ message: 'Credenciales Inválidas' });
        }

        const user = await findUserByEmail(email);

        if (!user) {
            return res.status(401).json({ message: 'Credenciales Inválidas' });
        }

        const coincide = await bcrypt.compare(password, user.password);

        if (!coincide) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        if (user.activo === false) {
            return res.status(403).json({ message: 'Esta cuenta está desactivada' });
        }

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        //Calcular fecha de expiracion del refresh (7 días desde ahora)
        const expira = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        // Solo una sesión activa por cuenta -- al iniciar sesión de nuevo
        // (desde otro dispositivo o navegador) se invalida cualquier
        // refresh token anterior, así ese otro dispositivo no puede
        // seguir renovando su sesión en silencio.
        await deleteSesiones(user.id);
        await insertSesiones(user.id, refreshToken, expira);

        res.cookie('token', accessToken, cookieOptions);

        res.status(200).json({
            email: user.email,
            accessToken,
            refreshToken
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error del servidor' })
    }
}

const getProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'No autenticado' });
        }

        let esPerfilCompleto = true;

        if (req.user.rol_id === 3) {
            const cli_id = await getClienteIdByUserId(req.user.id);
            const cliente = cli_id ? await getClienteById(cli_id) : null;
            esPerfilCompleto = cliente ? cliente.perfil_completo : false;
        }

        res.json({ ...req.user, perfil_completo: esPerfilCompleto });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor' });
    }
}

const logout = async (req, res) => {
    try {
        await deleteSesiones(req.user.id);
        res.clearCookie('token', cookieOptions);
        res.status(200).json({ message: 'Sesion cerrada' });
    } catch (error) {
        console.error('Error:', error)
        res.status(500).json({ message: 'Error del servidor' });
    }
}

const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token requerido' });
        }

        const sesion = await selectSesionesByToken(refreshToken);

        if (!sesion) {
            return res.status(401).json({ message: 'Refresh token inválido' })
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

        const accessToken = generateAccessToken(decoded.id);

        res.cookie('token', accessToken, cookieOptions);

        res.json({ message: 'Token renovado', accessToken })
    } catch (error) {
        console.error(error)
        res.status(401).json({ message: "Refresh token expirado o invàlido" })
    }
}

export { register, login, getProfile, logout, refresh };