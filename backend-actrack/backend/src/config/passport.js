import passport from "passport";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { findUserByEmail } from "../models/usuarios.js";
import { insertOauthCuentas, selectOauthCuentaByProvider } from "../models/oauth_cuentas.js";
import { generateAccessToken } from "../utils/authUtils.js";
import pool from './database.js';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    const client = await pool.connect();
    try {
        let oauth = await selectOauthCuentaByProvider(profile.id, 'google')

        if (!oauth) {
            let user = await findUserByEmail(profile.emails[0].value)

            if (!user) {
                await client.query('BEGIN');

                const resultUsuario = await client.query(
                    `INSERT INTO usuarios (rol_id, nombre, email, password)
                     VALUES ($1, $2, $3, $4) RETURNING id, nombre, email`,
                    [3, profile.displayName, profile.emails[0].value, null]
                );
                user = resultUsuario.rows[0];

                // Perfil de cliente "a medias" -- sin teléfono/dirección
                // todavía, marcado como incompleto para que el frontend
                // lo mande a la pantalla de "completa tu perfil".
                await client.query(
                    `INSERT INTO clientes (usu_id, nombre, email, telefono, direccion, activo, perfil_completo)
                     VALUES ($1, $2, $3, '', '', true, false)`,
                    [user.id, profile.displayName, profile.emails[0].value]
                );

                await client.query('COMMIT');
            }

            oauth = await insertOauthCuentas({ usu_id: user.id, proveedor: 'google', provider_uid: profile.id })
        }

        const token = generateAccessToken(oauth.usu_id)
        done(null, { token })
    } catch (error) {
        await client.query('ROLLBACK');
        done(error, null)
    } finally {
        client.release();
    }
}
))