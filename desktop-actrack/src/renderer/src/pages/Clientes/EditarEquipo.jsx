import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const EditarEquipo = () => {
    const { id } = useParams(); // id del EQUIPO (no del cliente, ojo)
    const navigate = useNavigate();
    const { apiFetch } = useAuth();

    const [marcas, setMarcas] = useState([]);
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
                const [resEquipo, resMarcas] = await Promise.all([
                    apiFetch(`/api/equipos/${id}`),
                    apiFetch("/api/marcas/"),
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

    if (loading) return <p style={{ padding: "24px" }}>Cargando...</p>;

    return (
        <div style={{ padding: "24px", maxWidth: "480px" }}>
            <h2>Editar Equipo</h2>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <label style={{ display: "block", marginBottom: "12px" }}>
                    <span style={{ display: "block", marginBottom: "4px" }}>Marca *</span>
                    <select value={marId} onChange={(e) => setMarId(e.target.value)} style={{ width: "100%", padding: "8px" }}>
                        {marcas.map((m) => (
                            <option key={m.id} value={m.id}>{m.nombre}</option>
                        ))}
                    </select>
                </label>

                <label style={{ display: "block", marginBottom: "12px" }}>
                    <span style={{ display: "block", marginBottom: "4px" }}>Tipo *</span>
                    <input value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ width: "100%", padding: "8px" }} />
                </label>

                <label style={{ display: "block", marginBottom: "12px" }}>
                    <span style={{ display: "block", marginBottom: "4px" }}>Modelo *</span>
                    <input value={modelo} onChange={(e) => setModelo(e.target.value)} style={{ width: "100%", padding: "8px" }} />
                </label>

                <label style={{ display: "block", marginBottom: "12px" }}>
                    <span style={{ display: "block", marginBottom: "4px" }}>Número de serie *</span>
                    <input value={numeroSerie} onChange={(e) => setNumeroSerie(e.target.value)} style={{ width: "100%", padding: "8px" }} />
                </label>

                <label style={{ display: "block", marginBottom: "12px" }}>
                    <span style={{ display: "block", marginBottom: "4px" }}>Foto actual</span>
                    {imagenActual ? (
                        <img src={imagenActual} alt={modelo} style={{ width: "120px", borderRadius: "8px", display: "block", marginBottom: "8px" }} />
                    ) : (
                        <p style={{ color: "#9ca3af", fontSize: "13px" }}>Sin foto todavía</p>
                    )}
                    <input type="file" accept="image/*" onChange={(e) => setArchivoNuevo(e.target.files[0])} />
                    <p style={{ color: "#6b7280", fontSize: "12px" }}>Deja este campo vacío para conservar la foto actual</p>
                </label>

                <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                    <button type="submit" disabled={guardando}>{guardando ? "Guardando..." : "Guardar cambios"}</button>
                    <button type="button" onClick={() => navigate(`/clientes/${cliId}`)}>Cancelar</button>
                </div>
            </form>
        </div>
    );
};

export default EditarEquipo;