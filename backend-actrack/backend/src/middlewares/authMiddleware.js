import jwt from 'jsonwebtoken'
import pool from '../config/database.js'

export const protect = async (req, res, next) => {
  const token = req.cookies?.token

  if (!token) {
    return res.status(401).json({ message: 'No autorizado, token faltante' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const result = await pool.query('SELECT id, nombre, email, rol_id FROM usuarios WHERE id = $1', [decoded.id])
    req.user = result.rows[0]
    next()
  } catch (error) {
    return res.status(401).json({ message: 'No autorizado, token inválido' })
  }
}
