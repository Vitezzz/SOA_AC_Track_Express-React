//index.js starts tour server
import dotenv from "dotenv";

//testeo conexión db
import app from './app.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT , () => {
    console.log(`Server is running on port ${PORT}`);
});