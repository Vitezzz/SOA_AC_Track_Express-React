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

    if (loading) return <p style={{ padding: "24px" }}>Cargando...</p>;

    return (
        <div style={{ padding: "24px", maxWidth: "480px" }}>
            <h2>Nuevo Técnico</h2>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <label style={{ display: "block", marginBottom: "12px" }}>
                    <span style={{ display: "block", marginBottom: "4px" }}>Nombre *</span>
                    <input value={nombre} onChange={(e) => setNombre(e.target.value)} style={{ width: "100%", padding: "8px" }} />
                </label>
                <label style={{ display: "block", marginBottom: "12px" }}>
                    <span style={{ display: "block", marginBottom: "4px" }}>Apellido paterno</span>
                    <input value={paterno} onChange={(e) => setPaterno(e.target.value)} style={{ width: "100%", padding: "8px" }} />
                </label>
                <label style={{ display: "block", marginBottom: "12px" }}>
                    <span style={{ display: "block", marginBottom: "4px" }}>Apellido materno</span>
                    <input value={materno} onChange={(e) => setMaterno(e.target.value)} style={{ width: "100%", padding: "8px" }} />
                </label>
                <label style={{ display: "block", marginBottom: "12px" }}>
                    <span style={{ display: "block", marginBottom: "4px" }}>Email (será su usuario de acceso) *</span>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: "8px" }} />
                </label>
                <label style={{ display: "block", marginBottom: "12px" }}>
                    <span style={{ display: "block", marginBottom: "4px" }}>Contraseña temporal *</span>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: "8px" }} />
                </label>
                <label style={{ display: "block", marginBottom: "12px" }}>
                    <span style={{ display: "block", marginBottom: "4px" }}>Especialidad *</span>
                    <select value={espId} onChange={(e) => setEspId(e.target.value)} style={{ width: "100%", padding: "8px" }}>
                        <option value="">Selecciona una especialidad</option>
                        {especialidades.map((e) => (
                            <option key={e.id} value={e.id}>{e.nombre}</option>
                        ))}
                    </select>
                </label>

                <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                    <button type="submit" disabled={guardando}>
                        {guardando ? "Creando..." : "Crear técnico"}
                    </button>
                    <button type="button" onClick={() => navigate("/tecnicos")}>Cancelar</button>
                </div>
            </form>
        </div>
    );
};

export default CrearTecnico;