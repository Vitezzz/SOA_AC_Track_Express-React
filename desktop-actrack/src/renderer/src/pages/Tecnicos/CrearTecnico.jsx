import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const CrearTecnico = () => {
    const navigate = useNavigate();
    const { apiFetch } = useAuth();

    const [especialidades, setEspecialidades] = useState([]);
    const [nombre, setNombre] = useState("");
    const [paterno, setPaterno] = useState("");
    const [materno, setMaterno] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [espId, setEspId] = useState("");

    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const cargarEspecialidades = async () => {
            try {
                const res = await apiFetch("/api/especialidad/");
                if (res.ok) setEspecialidades(await res.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        cargarEspecialidades();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!nombre || !email || !password || !espId) {
            setError("Completa todos los campos obligatorios");
            return;
        }

        setGuardando(true);
        try {
            const res = await apiFetch("/api/tecnicos/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre, paterno, materno, email, password,
                    esp_id: Number(espId),
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "No se pudo crear el técnico");

            navigate("/tecnicos");
        } catch (err) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    };

    if (loading) return <p className="page">Cargando...</p>;

    return (
        <div className="page page-narrow">
            <h2>Nuevo Técnico</h2>

            {error && <p className="error-text">{error}</p>}

            <form onSubmit={handleSubmit} className="form">
                <label>
                    <span>Nombre *</span>
                    <input value={nombre} onChange={(e) => setNombre(e.target.value)} />
                </label>
                <label>
                    <span>Apellido paterno</span>
                    <input value={paterno} onChange={(e) => setPaterno(e.target.value)} />
                </label>
                <label>
                    <span>Apellido materno</span>
                    <input value={materno} onChange={(e) => setMaterno(e.target.value)} />
                </label>
                <label>
                    <span>Email (será su usuario de acceso) *</span>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>
                <label>
                    <span>Contraseña temporal *</span>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </label>
                <label>
                    <span>Especialidad *</span>
                    <select value={espId} onChange={(e) => setEspId(e.target.value)}>
                        <option value="">Selecciona una especialidad</option>
                        {especialidades.map((e) => (
                            <option key={e.id} value={e.id}>{e.nombre}</option>
                        ))}
                    </select>
                </label>

                <div className="form-actions">
                    <button type="submit" disabled={guardando} className="btn-primary">
                        {guardando ? "Creando..." : "Crear técnico"}
                    </button>
                    <button type="button" onClick={() => navigate("/tecnicos")}>Cancelar</button>
                </div>
            </form>
        </div>
    );
};

export default CrearTecnico;