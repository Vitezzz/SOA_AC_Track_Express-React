import passport from "passport";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { findUserByEmail, createUser } from "../models/usuarios.js";
import { insertOauthCuentas, selectOauthCuentaByProvider } from "../models/oauth_cuentas.js";
import { generateAccessToken } from "../utils/authUtils.js";

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let oauth = await selectOauthCuentaByProvider(profile.id, 'google')

        if (!oauth) {
            let user = await findUserByEmail(profile.emails[0].value)
            if (!user) {
                user = await createUser({
                    rol_id: 3,
                    nombre: profile.displayName,
                    email: profile.emails[0].value,
                    password: null
                })
            }
            oauth = await insertOauthCuentas({ usu_id: user.id, proveedor: 'google', provider_uid: profile.id })
        }
        const token = generateAccessToken(oauth.usu_id)
        done(null, {token})
    } catch (error) {
        done(error, null)
    }
}
))