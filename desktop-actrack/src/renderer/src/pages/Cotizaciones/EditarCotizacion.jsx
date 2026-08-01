import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const EditarCotizacion = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { apiFetch } = useAuth();

    const [cotizacion, setCotizacion] = useState(null);
    const [tecnicos, setTecnicos] = useState([]);

    const [tecId, setTecId] = useState("");
    const [estado, setEstado] = useState("");
    const [total, setTotal] = useState("");
    const [notas, setNotas] = useState("");

    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");
    const [guardado, setGuardado] = useState(false);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [resCotizacion, resTecnicos] = await Promise.all([
                    apiFetch(`/api/cotizaciones/${id}`),
                    apiFetch("/api/tecnicos/"),
                ]);

                if (!resCotizacion.ok) throw new Error("No se pudo cargar la cotización");
                const data = await resCotizacion.json();
                setCotizacion(data);
                setTecId(data.tec_id);
                setEstado(data.estado);
                setTotal(data.total);
                setNotas(data.notas || "");

                if (resTecnicos.status !== 404 && resTecnicos.ok) setTecnicos(await resTecnicos.json());
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
            const res = await apiFetch(`/api/cotizaciones/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ord_id: cotizacion.ord_id,
                    tec_id: Number(tecId),
                    cli_id: cotizacion.cli_id,
                    folio: cotizacion.folio,
                    estado,
                    total: Number(total),
                    notas,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "No se pudo actualizar la cotización");

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
            <h2>Editar Cotización: {cotizacion?.folio}</h2>

            {error && <p className="error-text">{error}</p>}
            {guardado && <p className="success-text">¡Cotización actualizada correctamente!</p>}

            <form onSubmit={handleSubmit} className="form">
                <label>
                    <span>Estado</span>
                    <select value={estado} onChange={(e) => setEstado(e.target.value)}>
                        <option value="borrador">Borrador</option>
                        <option value="enviada">Enviada</option>
                        <option value="aprobada">Aprobada</option>
                        <option value="rechazada">Rechazada</option>
                    </select>
                </label>

                <label>
                    <span>Técnico responsable</span>
                    <select value={tecId} onChange={(e) => setTecId(e.target.value)}>
                        {tecnicos.map((tec) => (
                            <option key={tec.id} value={tec.id}>Técnico #{tec.usu_id}</option>
                        ))}
                    </select>
                </label>

                <label>
                    <span>Total</span>
                    <input type="number" step="0.01" min="0" value={total} onChange={(e) => setTotal(e.target.value)} />
                </label>

                <label>
                    <span>Notas</span>
                    <textarea value={notas} onChange={(e) => setNotas(e.target.value)} />
                </label>

                <div className="form-actions">
                    <button type="submit" disabled={guardando} className="btn-primary">{guardando ? "Guardando..." : "Guardar cambios"}</button>
                    <button type="button" onClick={() => navigate("/cotizaciones")}>Volver</button>
                </div>
            </form>
        </div>
    );
};

export default EditarCotizacion;