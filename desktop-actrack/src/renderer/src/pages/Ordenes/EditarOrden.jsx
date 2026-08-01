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
    const [disponibilidad, setDisponibilidad] = useState({});

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
                    apiFetch("/api/tecnicos/todos"),
                ]);

                if (!resOrden.ok) throw new Error("No se pudo cargar la orden");
                const dataOrden = await resOrden.json();
                setOrden(dataOrden);
                setEstatus(dataOrden.estatus);
                setTecId(dataOrden.tec_id || "");

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

    useEffect(() => {
        if (!orden?.fecha_programada) return;

        const consultarDisponibilidad = async () => {
            const res = await apiFetch(
                `/api/tecnicos/disponibilidad?fecha=${orden.fecha_programada}&excluir=${id}`
            );
            if (res.ok) {
                const datos = await res.json();
                const mapa = {};
                datos.forEach((t) => { mapa[t.id] = t.ocupado; });
                setDisponibilidad(mapa);
            }
        };
        consultarDisponibilidad();
    }, [orden?.fecha_programada, id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setGuardado(false);
        setGuardando(true);

        try {
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

    if (loading) return <p className="page">Cargando...</p>;

    return (
        <div className="page page-narrow">
            <h2>Editar Orden: {orden?.folio}</h2>

            {error && <p className="error-text">{error}</p>}
            {guardado && <p className="success-text">¡Orden actualizada correctamente!</p>}

            <form onSubmit={handleSubmit} className="form">
                <label>
                    <span>Estatus</span>
                    <select
                        value={estatus}
                        onChange={(e) => setEstatus(e.target.value)}
                    >
                        {ESTADOS_POSIBLES.map((valor) => (
                            <option key={valor} value={valor}>{valor}</option>
                        ))}
                    </select>
                </label>

                <label>
                    <span>Técnico asignado</span>
                    <select
                        value={tecId}
                        onChange={(e) => setTecId(e.target.value)}
                    >
                        <option value="">Sin asignar</option>
                        {tecnicos.map((tec) => (
                            <option key={tec.id} value={tec.id} disabled={disponibilidad[tec.id]}>
                                Técnico #{tec.usu_id} {disponibilidad[tec.id] ? "— Ocupado en esta fecha" : ""}
                            </option>
                        ))}
                    </select>
                </label>

                <div className="form-actions">
                    <button type="submit" disabled={guardando} className="btn-primary">
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