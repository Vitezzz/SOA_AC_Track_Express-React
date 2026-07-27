import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ESTADOS_POSIBLES = ["pendiente", "en_proceso", "pagada", "completada", "cancelada"];

const EditarOrden = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { apiFetch } = useAuth();

    const [orden, setOrden] = useState(null);
    const [tecnicos, setTecnicos] = useState([]);

    const [estatus, setEstatus] = useState("");
    const [tecId, setTecId] = useState("");

    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");
    const [guardado, setGuardado] = useState(false);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [resOrden, resTecnicos] = await Promise.all([
                    apiFetch(`/api/ordenes_servicio/${id}`),
                    apiFetch("/api/tecnicos/"),
                ]);

                if (!resOrden.ok) throw new Error("No se pudo cargar la orden");
                const dataOrden = await resOrden.json();
                setOrden(dataOrden);
                setEstatus(dataOrden.estatus);
                setTecId(dataOrden.tec_id || "");

                // tecnicos puede dar 404 si no hay ninguno disponible -- lo
                // tratamos como lista vacía, no como error real.
                if (resTecnicos.status === 404) {
                    setTecnicos([]);
                } else if (resTecnicos.ok) {
                    setTecnicos(await resTecnicos.json());
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setGuardado(false);
        setGuardando(true);

        try {
            // El PUT exige TODOS los campos -- reusamos los que ya venían
            // en "orden" (cliente, equipo, categoría, etc.) y solo
            // cambiamos estatus/tec_id, que es lo que este formulario edita.
            const res = await apiFetch(`/api/ordenes_servicio/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cli_id: orden.cli_id,
                    equ_id: orden.equ_id,
                    cat_id: orden.cat_id,
                    pri_id: orden.pri_id,
                    folio: orden.folio,
                    prioridad: orden.prioridad,
                    estatus,
                    descripcion: orden.descripcion,
                    fecha_programada: orden.fecha_programada,
                    fecha_cierre: orden.fecha_cierre,
                    tec_id: tecId ? Number(tecId) : null,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "No se pudo actualizar la orden");

            setGuardado(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    };

    if (loading) return <p style={{ padding: "24px" }}>Cargando...</p>;

    return (
        <div style={{ padding: "24px", maxWidth: "480px" }}>
            <h2>Editar Orden: {orden?.folio}</h2>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {guardado && <p style={{ color: "green" }}>¡Orden actualizada correctamente!</p>}

            <form onSubmit={handleSubmit}>
                <label style={{ display: "block", marginBottom: "12px" }}>
                    <span style={{ display: "block", marginBottom: "4px" }}>Estatus</span>
                    <select
                        value={estatus}
                        onChange={(e) => setEstatus(e.target.value)}
                        style={{ width: "100%", padding: "8px" }}
                    >
                        {ESTADOS_POSIBLES.map((valor) => (
                            <option key={valor} value={valor}>{valor}</option>
                        ))}
                    </select>
                </label>

                <label style={{ display: "block", marginBottom: "12px" }}>
                    <span style={{ display: "block", marginBottom: "4px" }}>Técnico asignado</span>
                    <select
                        value={tecId}
                        onChange={(e) => setTecId(e.target.value)}
                        style={{ width: "100%", padding: "8px" }}
                    >
                        <option value="">Sin asignar</option>
                        {tecnicos.map((tec) => (
                            <option key={tec.id} value={tec.id}>
                                Técnico #{tec.usu_id}
                            </option>
                        ))}
                    </select>
                </label>

                <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                    <button type="submit" disabled={guardando}>
                        {guardando ? "Guardando..." : "Guardar cambios"}
                    </button>
                    <button type="button" onClick={() => navigate("/ordenes")}>
                        Volver
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditarOrden;