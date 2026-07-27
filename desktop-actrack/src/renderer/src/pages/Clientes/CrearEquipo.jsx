import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const CrearEquipo = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { apiFetch } = useAuth();

    const [marcas, setMarcas] = useState([]);
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
                const res = await apiFetch("/api/marcas/");
                if (res.ok) setMarcas(await res.json());
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

    if (loading) return <p style={{ padding: "24px" }}>Cargando...</p>;

    return (
        <div style={{ padding: "24px", maxWidth: "480px" }}>
            <h2>Registrar Equipo</h2>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <label style={{ display: "block", marginBottom: "12px" }}>
                    <span style={{ display: "block", marginBottom: "4px" }}>Marca *</span>
                    <select value={marId} onChange={(e) => setMarId(e.target.value)} style={{ width: "100%", padding: "8px" }}>
                        <option value="">Selecciona una marca</option>
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
                    <span style={{ display: "block", marginBottom: "4px" }}>Foto del equipo (opcional)</span>
                    <input type="file" accept="image/*" onChange={(e) => setArchivoImagen(e.target.files[0])} />
                </label>

                <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                    <button type="submit" disabled={guardando}>{guardando ? "Guardando..." : "Registrar equipo"}</button>
                    <button type="button" onClick={() => navigate(`/clientes/${id}`)}>Cancelar</button>
                </div>
            </form>
        </div>
    );
};

export default CrearEquipo;