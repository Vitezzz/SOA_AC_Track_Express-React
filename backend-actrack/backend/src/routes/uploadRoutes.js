import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { protect } from '../middlewares/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de multer: a dónde guardar el archivo, y con qué nombre
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
        // Nombre único: fecha + nombre original, para que 2 archivos
        // con el mismo nombre nunca se pisen entre sí.
        const nombreUnico = `${Date.now()}_${file.originalname}`;
        cb(null, nombreUnico);
    },
});

const upload = multer({ storage });

const router = express.Router();

// upload.single('archivo') = espera UN solo archivo, en un campo
// llamado "archivo" dentro del form-data que mande el frontend.
router.post('/', protect, upload.single('archivo'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No se recibió ningún archivo' });
    }

    // Armamos la URL pública completa donde ese archivo va a vivir
    const urlPublica = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.status(201).json({ url: urlPublica });
});

export default router;