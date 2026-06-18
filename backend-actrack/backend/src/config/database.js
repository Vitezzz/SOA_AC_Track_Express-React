//connects your backend to the data base
import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

//Creamos el pool de conexiones a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("connect", () => {
  console.log("Connected to the database")
})

pool.on("error", (err) => {
  console.log("Database error", err)
})

//Exportamos el pool para usarlo en los models
export default pool;
