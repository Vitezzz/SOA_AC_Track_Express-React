import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const EditarTecnico = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { apiFetch, user } = useAuth();
    const esAdmin = user?.rol_id === 2;

    const [tecnico, setTecnico] = useState(null);
    const [especialidades, setEspecialidades] = useState([]);

    const [espId, setEspId] = useState("");
    const [disponible, setDisponible] = useState(true);
    const [nombre, setNombre] = useState("");
    const [paterno, setPaterno] = useState("");
    const [materno, setMaterno] = useState("");
    const [email, setEmail] = useState("");

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
                setNombre(dataTecnico.usuario_nombre || "");
                setPaterno(dataTecnico.usuario_paterno || "");
                setMaterno(dataTecnico.usuario_materno || "");
                setEmail(dataTecnico.usuario_email || "");

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
            // Editar nombre/email es cosa de admin (PUT /api/usuarios/:id
            // así lo exige en el backend) -- un supervisor solo manda el PUT
            // de especialidad/disponibilidad, para no disparar un 403 al pedo.
            const peticiones = [
                apiFetch(`/api/tecnicos/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        usu_id: tecnico.usu_id,
                        esp_id: Number(espId),
                        disponible,
                    }),
                }),
            ];
            if (esAdmin) {
                peticiones.push(
                    apiFetch(`/api/usuarios/${tecnico.usu_id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ nombre, paterno, materno, email }),
                    })
                );
            }

            const [resTecnico, resUsuario] = await Promise.all(peticiones);

            const dataTecnico = await resTecnico.json();
            if (!resTecnico.ok) throw new Error(dataTecnico.message || "No se pudo actualizar el técnico");

            if (resUsuario) {
                const dataUsuario = await resUsuario.json();
                if (!resUsuario.ok) throw new Error(dataUsuario.message || "No se pudieron actualizar los datos del técnico");
            }

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
            <h2>Editar Técnico — {tecnico?.nombre || `#${tecnico?.usu_id}`}</h2>

            {error && <p className="error-text">{error}</p>}
            {guardado && <p className="success-text">¡Técnico actualizado correctamente!</p>}

            <form onSubmit={handleSubmit} className="form">
                <label>
                    <span>Nombre(s)</span>
                    <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} disabled={!esAdmin} required />
                </label>

                <label>
                    <span>Apellido paterno</span>
                    <input type="text" value={paterno} onChange={(e) => setPaterno(e.target.value)} disabled={!esAdmin} />
                </label>

                <label>
                    <span>Apellido materno</span>
                    <input type="text" value={materno} onChange={(e) => setMaterno(e.target.value)} disabled={!esAdmin} />
                </label>

                <label>
                    <span>Email</span>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!esAdmin} required />
                </label>
                {!esAdmin && (
                    <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "-8px" }}>
                        Solo un administrador puede editar el nombre y el email.
                    </p>
                )}

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