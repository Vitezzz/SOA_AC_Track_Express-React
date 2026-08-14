import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const EditarEquipo = () => {
    const { id } = useParams(); // id del EQUIPO (no del cliente, ojo)
    const navigate = useNavigate();
    const { apiFetch } = useAuth();

    const [marcas, setMarcas] = useState([]);
    const [ordenes, setOrdenes] = useState([]);
    const [cliId, setCliId] = useState("");
    const [marId, setMarId] = useState("");
    const [modelo, setModelo] = useState("");
    const [numeroSerie, setNumeroSerie] = useState("");
    const [tipo, setTipo] = useState("");
    const [imagenActual, setImagenActual] = useState(null);
    const [archivoNuevo, setArchivoNuevo] = useState(null);

    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [resEquipo, resMarcas, resOrdenes] = await Promise.all([
                    apiFetch(`/api/equipos/${id}`),
                    apiFetch("/api/marcas/"),
                    apiFetch("/api/ordenes_servicio"),
                ]);

                if (!resEquipo.ok) throw new Error("No se pudo cargar el equipo");
                const data = await resEquipo.json();
                setCliId(data.cli_id);
                setMarId(data.mar_id);
                setModelo(data.modelo);
                setNumeroSerie(data.numero_serie);
                setTipo(data.tipo);
                setImagenActual(data.imagen_url);

                if (resMarcas.ok) setMarcas(await resMarcas.json());
                if (resOrdenes.ok) {
                    const todas = await resOrdenes.json();
                    setOrdenes(todas.filter((o) => o.equ_id === Number(id)));
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

        setGuardando(true);
        try {
            // Si el admin eligió una foto nueva, la subimos y reemplazamos
            // la anterior. Si no, dejamos la que ya tenía (imagenActual).
            let imagenUrl = imagenActual;

            if (archivoNuevo) {
                const formData = new FormData();
                formData.append("archivo", archivoNuevo);

                const resUpload = await apiFetch("/api/upload", { method: "POST", body: formData });
                const dataUpload = await resUpload.json();
                if (!resUpload.ok) throw new Error(dataUpload.message || "No se pudo subir la imagen");

                imagenUrl = dataUpload.url;
            }

            const res = await apiFetch(`/api/equipos/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cli_id: Number(cliId),
                    mar_id: Number(marId),
                    modelo,
                    numero_serie: numeroSerie,
                    tipo,
                    imagen_url: imagenUrl,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "No se pudo actualizar el equipo");

            navigate(`/clientes/${cliId}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    };

    if (loading) return <p className="page">Cargando...</p>;

    return (
        <div className="page">
            <Link to={`/clientes/${cliId}`} className="page-back">← Volver al cliente</Link>
            <div className="page-header">
                <h2>Editar Equipo</h2>
            </div>

            {error && <p className="error-text">{error}</p>}

            <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "1.5rem", alignItems: "start", width: "100%" }}>
            <div className="panel">
            <form onSubmit={handleSubmit} className="form">
                <label>
                    <span>Marca *</span>
                    <select value={marId} onChange={(e) => setMarId(e.target.value)}>
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
                    <span>Foto actual</span>
                    {imagenActual ? (
                        <img src={imagenActual} alt={modelo} style={{ width: "120px", borderRadius: "8px", display: "block", marginBottom: "8px" }} />
                    ) : (
                        <p className="muted-text">Sin foto todavía</p>
                    )}
                    <input type="file" accept="image/*" onChange={(e) => setArchivoNuevo(e.target.files[0])} />
                    <p className="hint-text">Deja este campo vacío para conservar la foto actual</p>
                </label>

                <div className="form-actions">
                    <button type="submit" disabled={guardando} className="btn-primary">{guardando ? "Guardando..." : "Guardar cambios"}</button>
                    <button type="button" onClick={() => navigate(`/clientes/${cliId}`)}>Cancelar</button>
                </div>
            </form>
            </div>

            <div className="panel">
                <p style={{ fontWeight: 600, marginBottom: "0.9rem" }}>Historial de órdenes ({ordenes.length})</p>
                {ordenes.length === 0 ? (
                    <p className="muted-text">Este equipo no tiene órdenes registradas.</p>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {ordenes.map((o) => (
                            <div key={o.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                                <span>{o.folio}</span>
                                <span className="muted-text">{o.estatus}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            </div>
        </div>
    );
};

export default EditarEquipo;