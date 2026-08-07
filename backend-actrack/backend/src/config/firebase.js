import { initializeApp, cert } from 'firebase-admin/app';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccount = JSON.parse(
    readFileSync(path.join(__dirname, '../../firebase-service-account.json'), 'utf-8')
);

const firebaseApp = initializeApp({
    credential: cert(serviceAccount),
});

export default firebaseApp;