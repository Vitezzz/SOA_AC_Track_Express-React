import { useState, useEffect } from "react";
import { Card } from "../../components/Card.jsx";
import Table from '../../components/Table.jsx';
import { useAuth } from "../../context/AuthContext.jsx"; 

const MisEquipos = () => {

    // TODO 1: declara un estado "equipos" (arreglo, inicia vacío) para
    // guardar lo que venga del backend, en vez del "devices" hardcodeado.
    const [equipos, setEquipos] = useState([]);

    // TODO 2: declara un estado "loading" (inicia en true) y uno "error"
    // (inicia en cadena vacía) — igual que en SolicitudServicio.
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // TODO 3: saca "apiFetch" de useAuth()
    const { apiFetch } = useAuth();

    // TODO 4: useEffect que se ejecuta una sola vez al montar el componente,
    // y adentro:
    useEffect(() => {
        const caragarEquipos = async () => {
            try {
                //   - llama apiFetch("/api/equipos/")
                const res = await apiFetch('/api/equipos/');
                //   - si res.ok, conviértelo a json() y guárdalo con setEquipos
                if (!res.ok) throw new Error("No se pudireon cargar los equipos");

                setEquipos(await res.json())
                //   - si no, lanza un error con throw new Error(...)
            } catch (err) {
                //   - en el catch, guarda el mensaje con setError
                setError(err.message)
            } finally {
                //   - en el finally, setLoading(false)
                // (pista: es CASI idéntico al primer useEffect que hicimos en
                // SolicitudServicio, solo que aquí es un solo fetch, no Promise.all)
                setLoading(false);
            }
        }
        caragarEquipos();
    }, [])
    // TODO 5: antes del return, si loading es true, regresa algo simple
    // como <p>Cargando...</p>
    if (loading) return <p className="text-center mt-10">Cargando...</p>;

    return (
        <>
            <h2>Mis Equipos</h2>
            <Card>
                {/* TODO 6: si hay error, muéstralo con un <p> (mismo estilo
                text-red-500 que usamos en los otros formularios) */}
                {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                {/* TODO 7: cambia object={devices} por object={equipos} */}
                {equipos.length === 0 ? (
                    <p className="text-gray-500 text-center">
                        Todavía no tienes equipos registrados.
                    </p>
                ) : (
                    <Table object={equipos} />
                )}

            </Card>
        </>
    );
}

export default MisEquipos;

