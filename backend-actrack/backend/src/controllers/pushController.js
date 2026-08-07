import { upsertPushToken } from '../models/push_tokens.js';

const registrarToken = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ message: 'Falta el token' });

        await upsertPushToken(req.user.id, token);
        res.status(200).json({ message: 'Token registrado' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
}

export { registrarToken };