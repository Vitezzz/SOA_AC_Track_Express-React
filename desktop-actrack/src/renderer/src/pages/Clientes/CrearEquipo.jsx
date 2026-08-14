import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const CrearEquipo = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { apiFetch } = useAuth();

    const [marcas, setMarcas] = useState([]);
    const [cliente, setCliente] = useState(null);
    const [equiposDelCliente, setEquiposDelCliente] = useState([]);
    const [marId, setMarId] = useState("");
    const [modelo, setModelo] = useState("");
    const [numeroSerie, setNumeroSerie] = useState("");
    const [tipo, setTipo] = useState("");
    const [archivoImagen, setArchivoImagen] = useState(null);

    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const cargarMarcas = async () => {
            try {
                const [resMarcas, resCliente, resEquipos] = await Promise.all([
                    apiFetch("/api/marcas/"),
                    apiFetch(`/api/clientes/${id}`),
                    apiFetch("/api/equipos/"),
                ]);
                if (resMarcas.ok) setMarcas(await resMarcas.json());
                if (resCliente.ok) setCliente(await resCliente.json());
                if (resEquipos.ok) {
                    const todos = await resEquipos.json();
                    setEquiposDelCliente(todos.filter((eq) => String(eq.cli_id) === String(id)));
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        cargarMarcas();

        const ultimos = localStorage.getItem("ultimoEquipoUsado");
        if (ultimos) {
            const { marId: mId, tipo: t, modelo: m } = JSON.parse(ultimos);
            setMarId(mId || "");
            setTipo(t || "");
            setModelo(m || "");
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!marId || !modelo || !numeroSerie || !tipo) {
            setError("Completa todos los campos");
            return;
        }

        setGuardando(true);
        try {
            let imagenUrl = null;

            if (archivoImagen) {
                const formData = new FormData();
                formData.append("archivo", archivoImagen);

                // OJO: NO pongas "Content-Type" aquí -- el navegador/Electron
                // necesita ponerlo él solo (incluye un "boundary" especial
                // que identifica dónde empieza y termina el archivo dentro
                // del cuerpo de la petición).
                const resUpload = await apiFetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                const dataUpload = await resUpload.json();
                if (!resUpload.ok) throw new Error(dataUpload.message || "No se pudo subir la imagen");

                imagenUrl = dataUpload.url;
            }

            const res = await apiFetch("/api/equipos/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cli_id: Number(id),
                    mar_id: Number(marId),
                    modelo,
                    numero_serie: numeroSerie,
                    tipo,
                    imagen_url: imagenUrl,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "No se pudo registrar el equipo");

            localStorage.setItem("ultimoEquipoUsado", JSON.stringify({ marId, tipo, modelo }));

            navigate(`/clientes/${id}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    };

    if (loading) return <p className="page">Cargando...</p>;

    return (
        <div className="page">
            <Link to={`/clientes/${id}`} className="page-back">← Volver a {cliente?.nombre || "Cliente"}</Link>
            <div className="page-header">
                <h2>Registrar Equipo {cliente && <span className="muted-text" style={{ fontWeight: 400 }}>— para {cliente.nombre}</span>}</h2>
            </div>

            {error && <p className="error-text">{error}</p>}

            <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "1.5rem", alignItems: "start", width: "100%" }}>
            <div className="panel">
            <form onSubmit={handleSubmit} className="form">
                <label>
                    <span>Marca *</span>
                    <select value={marId} onChange={(e) => setMarId(e.target.value)}>
                        <option value="">Selecciona una marca</option>
                        {marcas.map((m) => (
                            <option key={m.id} value={m.id}>{m.nombre}</option>
                        ))}
                    </select>
                </label>

                <label>
                    <span>Tipo *</span>
                    <input value={tipo} onChange={(e) => setTipo(e.target.value)} />
                </label>

                <label>
                    <span>Modelo *</span>
                    <input value={modelo} onChange={(e) => setModelo(e.target.value)} />
                </label>

                <label>
                    <span>Número de serie *</span>
                    <input value={numeroSerie} onChange={(e) => setNumeroSerie(e.target.value)} />
                </label>

                <label>
                    <span>Foto del equipo (opcional)</span>
                    <input type="file" accept="image/*" onChange={(e) => setArchivoImagen(e.target.files[0])} />
                </label>

                <div className="form-actions">
                    <button type="submit" disabled={guardando} className="btn-primary">{guardando ? "Guardando..." : "Registrar equipo"}</button>
                    <button type="button" onClick={() => navigate(`/clientes/${id}`)}>Cancelar</button>
                </div>
            </form>
            </div>

            <div className="panel">
                <p style={{ fontWeight: 600, marginBottom: "0.9rem" }}>
                    Equipos que ya tiene ({equiposDelCliente.length})
                </p>
                {equiposDelCliente.length === 0 ? (
                    <p className="muted-text">Este cliente todavía no tiene equipos registrados.</p>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {equiposDelCliente.map((eq) => (
                            <div key={eq.id} style={{ fontSize: "0.875rem" }}>
                                {eq.tipo} — {eq.modelo} <span className="muted-text">({eq.numero_serie})</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            </div>
        </div>
    );
};

export default CrearEquipo;