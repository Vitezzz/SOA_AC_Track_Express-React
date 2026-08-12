import jwt from 'jsonwebtoken'
import pool from '../config/database.js'

export const protect = async (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No autorizado, token faltante' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const result = await pool.query('SELECT id, nombre, email, rol_id, activo FROM usuarios WHERE id = $1', [decoded.id])
    const usuario = result.rows[0]

    if (!usuario) {
      return res.status(401).json({ message: 'No autorizado, token inválido' })
    }

    // activo = false o NULL (cuentas viejas sin el campo seteado nunca se
    // desactivaron a propósito) siguen pasando -- solo bloqueamos cuando
    // alguien lo desactivó explícitamente desde Configuración.
    if (usuario.activo === false) {
      return res.status(403).json({ message: 'Esta cuenta está desactivada' })
    }

    req.user = usuario
    next()
  } catch (error) {
    return res.status(401).json({ message: 'No autorizado, token inválido' })
  }
}
