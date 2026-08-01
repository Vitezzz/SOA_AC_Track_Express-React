import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const EditarTecnico = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { apiFetch } = useAuth();

    const [tecnico, setTecnico] = useState(null);
    const [especialidades, setEspecialidades] = useState([]);

    const [espId, setEspId] = useState("");
    const [disponible, setDisponible] = useState(true);

    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");
    const [guardado, setGuardado] = useState(false);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [resTecnico, resEspecialidades] = await Promise.all([
                    apiFetch(`/api/tecnicos/${id}`),
                    apiFetch("/api/especialidad/"),
                ]);

                if (!resTecnico.ok) throw new Error("No se pudo cargar el técnico");
                const dataTecnico = await resTecnico.json();
                setTecnico(dataTecnico);
                setEspId(dataTecnico.esp_id);
                setDisponible(dataTecnico.disponible);

                if (resEspecialidades.ok) setEspecialidades(await resEspecialidades.json());
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
            const res = await apiFetch(`/api/tecnicos/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    usu_id: tecnico.usu_id,
                    esp_id: Number(espId),
                    disponible,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "No se pudo actualizar el técnico");

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
            <h2>Editar Técnico #{tecnico?.usu_id}</h2>

            {error && <p className="error-text">{error}</p>}
            {guardado && <p className="success-text">¡Técnico actualizado correctamente!</p>}

            <form onSubmit={handleSubmit} className="form">
                <label>
                    <span>Especialidad</span>
                    <select value={espId} onChange={(e) => setEspId(e.target.value)}>
                        {especialidades.map((e) => (
                            <option key={e.id} value={e.id}>{e.nombre}</option>
                        ))}
                    </select>
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={disponible}
                        onChange={(e) => setDisponible(e.target.checked)}
                    />
                    Disponible para asignación
                </label>

                <div className="form-actions">
                    <button type="submit" disabled={guardando} className="btn-primary">
                        {guardando ? "Guardando..." : "Guardar cambios"}
                    </button>
                    <button type="button" onClick={() => navigate("/tecnicos")}>Volver</button>
                </div>
            </form>
        </div>
    );
};

export default EditarTecnico;