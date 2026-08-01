import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const FormularioMantenimiento = () => {
    const { id } = useParams(); // undefined si estamos en "crear"
    const navigate = useNavigate();
    const { apiFetch } = useAuth();

    const esEdicion = Boolean(id);

    const [clientes, setClientes] = useState([]);
    const [equipos, setEquipos] = useState([]);

    const [cliId, setCliId] = useState("");
    const [equId, setEquId] = useState("");
    const [frecuenciaDias, setFrecuenciaDias] = useState("");
    const [proximaFecha, setProximaFecha] = useState("");
    const [activo, setActivo] = useState(true);

    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const peticiones = [
                    apiFetch("/api/clientes/"),
                    apiFetch("/api/equipos/"),
                ];
                if (esEdicion) peticiones.push(apiFetch(`/api/mantenimiento_preventivo/${id}`));

                const resultados = await Promise.all(peticiones);
                const [resClientes, resEquipos, resMantenimiento] = resultados;

                if (resClientes.ok) setClientes(await resClientes.json());
                if (resEquipos.ok) setEquipos(await resEquipos.json());

                if (esEdicion) {
                    if (!resMantenimiento.ok) throw new Error("No se pudo cargar el mantenimiento");
                    const data = await resMantenimiento.json();
                    setCliId(data.cli_id);
                    setEquId(data.equ_id);
                    setFrecuenciaDias(data.frecuencia_dias);
                    // Recorta la fecha ISO a solo "YYYY-MM-DD" para el input type=date
                    setProximaFecha(data.proxima_fecha?.split("T")[0] || "");
                    setActivo(data.activo);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, [id]);

    const equiposDelCliente = equipos.filter((eq) => String(eq.cli_id) === String(cliId));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!cliId || !equId || !frecuenciaDias || !proximaFecha) {
            setError("Completa todos los campos");
            return;
        }

        setGuardando(true);
        try {
            const url = esEdicion ? `/api/mantenimiento_preventivo/${id}` : "/api/mantenimiento_preventivo";
            const res = await apiFetch(url, {
                method: esEdicion ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cli_id: Number(cliId),
                    equ_id: Number(equId),
                    frecuencia_dias: Number(frecuenciaDias),
                    proxima_fecha: proximaFecha,
                    activo,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "No se pudo guardar el mantenimiento");

            navigate("/mantenimiento");
        } catch (err) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    };

    if (loading) return <p className="page">Cargando...</p>;

    return (
        <div className="page page-narrow">
            <h2>{esEdicion ? "Editar" : "Programar"} Mantenimiento</h2>

            {error && <p className="error-text">{error}</p>}

            <form onSubmit={handleSubmit} className="form">
                <label>
                    <span>Cliente *</span>
                    <select value={cliId} onChange={(e) => { setCliId(e.target.value); setEquId(""); }}>
                        <option value="">Selecciona un cliente</option>
                        {clientes.map((c) => (
                            <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                    </select>
                </label>

                <label>
                    <span>Equipo *</span>
                    <select value={equId} onChange={(e) => setEquId(e.target.value)} disabled={!cliId}>
                        <option value="">Selecciona un equipo</option>
                        {equiposDelCliente.map((eq) => (
                            <option key={eq.id} value={eq.id}>{eq.tipo} — {eq.modelo}</option>
                        ))}
                    </select>
                </label>

                <label>
                    <span>Frecuencia (días) *</span>
                    <input
                        type="number"
                        min="1"
                        value={frecuenciaDias}
                        onChange={(e) => setFrecuenciaDias(e.target.value)}
                    />
                </label>

                <label>
                    <span>Próxima fecha *</span>
                    <input
                        type="date"
                        value={proximaFecha}
                        onChange={(e) => setProximaFecha(e.target.value)}
                    />
                </label>

                <label>
                    <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
                    Activo
                </label>

                <div className="form-actions">
                    <button type="submit" disabled={guardando} className="btn-primary">
                        {guardando ? "Guardando..." : esEdicion ? "Guardar cambios" : "Programar"}
                    </button>
                    <button type="button" onClick={() => navigate("/mantenimiento")}>Cancelar</button>
                </div>
            </form>
        </div>
    );
};

export default FormularioMantenimiento;