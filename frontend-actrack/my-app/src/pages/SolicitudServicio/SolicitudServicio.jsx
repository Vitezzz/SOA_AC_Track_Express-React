import { useState, useEffect } from "react";
import { Card } from "../../components/Card";
import { useAuth } from "../../context/AuthContext";

// Traducción de num_prioridad -> texto, según la convención del proyecto
const NIVELES_PRIORIDAD = { 1: "baja", 2: "normal", 3: "alta", 4: "urgente" };

const SolicitudServicio = () => {
    // Catálogos que vienen del backend
    const [equipos, setEquipos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [prioridades, setPrioridades] = useState([]);

    // Lo que el usuario va eligiendo/escribiendo en el formulario
    // (ya no hay prioridadId: el cliente no elige prioridad, ver nota abajo)
    const [equipoId, setEquipoId] = useState("");
    const [categoriaId, setCategoriaId] = useState("");
    const [descripcionEquipo, setDescripcionEquipo] = useState("")
    const [descripcion, setDescripcion] = useState("");
    const [fechaProgramada, setFechaProgramada] = useState("");

    // Estados de control de la pantalla
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [folioCreado, setFolioCreado] = useState("");

    const { apiFetch, user } = useAuth();

    useEffect(() => {
        const cargarCatalogos = async () => {
            try {
                const [resEquipos, resCategorias, resPrioridades] = await Promise.all([
                    apiFetch("/api/equipos/"),
                    apiFetch("/api/categoriaServicio"),
                    apiFetch("/api/prioridad"),
                ]);

                if (!resEquipos.ok || !resCategorias.ok || !resPrioridades.ok) {
                    throw new Error("No se pudieron cargar los catálogos");
                }

                setEquipos(await resEquipos.json());
                setCategorias(await resCategorias.json());
                setPrioridades(await resPrioridades.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        cargarCatalogos();
    }, []);

    // Resuelve automáticamente cuál fila del catálogo "prioridad" corresponde
    // al nivel "normal" (num_prioridad === 2). El cliente nunca elige esto:
    // según tu propio documento de diseño, toda solicitud nace en 'normal'
    // y es el admin/supervisor quien la reclasifica después si hace falta.
    const prioridadNormal = prioridades.find((p) => p.num_prioridad === 2);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setFolioCreado("");

        if(user.perfil_completo === false){
            setError("Completa los datos de tu perfil antes de hacer una solicitud");
            return
        }

        if (!equipoId || !categoriaId || !descripcion || !fechaProgramada) {
            setError("Completa todos los campos antes de continuar");
            return;
        }

        if (equipoId === 'otro' && descripcionEquipo === "") {
            setError("Falta rellenar la descripcion del equipo");
            return;
        }

        if (!prioridadNormal) {
            setError("Falta configurar la prioridad 'normal' en el catálogo");
            return;
        }

        const equipoIdFinal = equipoId === 'otro' ? null : Number(equipoId);
        const descripcionFinal = equipoId === "otro" ? `Equipo : ${descripcionEquipo}\n\nFalla: ${descripcion}` : descripcion;

        setSubmitting(true);
        try {
            const res = await apiFetch("/api/ordenes_servicio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    equ_id: equipoIdFinal,
                    cat_id: Number(categoriaId),
                    pri_id: prioridadNormal.id,
                    prioridad: "normal",
                    estatus: "pendiente",
                    descripcion: descripcionFinal,
                    fecha_programada: fechaProgramada,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "No se pudo crear la solicitud");
            }

            setFolioCreado(data.folio);
            setEquipoId("");
            setCategoriaId("");
            setDescripcion("");
            setDescripcionEquipo("");
            setFechaProgramada("");
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <p className="text-center mt-10">Cargando...</p>;

    return (
        <div className="page-shell">
            <Card>
                <h1 className="page-title text-center">
                    Solicitar Servicio
                </h1>

                {folioCreado && (
                    <p className="form-success mb-4">
                        ¡Solicitud creada! Tu folio es <strong>{folioCreado}</strong>
                    </p>
                )}
                {error && <p className="form-error mb-4">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <label className="form-control w-full">
                        <span className="form-label">Equipo</span>
                        <select
                            className="form-input"
                            value={equipoId}
                            onChange={(e) => setEquipoId(e.target.value)}
                        >
                            <option value="">Selecciona un equipo</option>
                            <option value="otro">Otro / mi equipo no está en la lista</option>
                            {equipos.map((eq) => (
                                <option key={eq.id} value={eq.id}>
                                    {eq.tipo} — {eq.modelo} ({eq.numero_serie})
                                </option>
                            ))}
                        </select>
                        {
                            equipoId === "otro" && (
                                <label className="form-control w-full">
                                    <span className="text-sm font-medium text-gray-700 mb-1 block">
                                        Describe tu equipo
                                    </span>
                                    <textarea
                                        className="input input-bordered w-full rounded-lg border-gray-200 h-20"
                                        value={descripcionEquipo}
                                        onChange={(e) => setDescripcionEquipo(e.target.value)}
                                        placeholder="Ej. Split de pared Mirage, blanco, en la sala"
                                    />
                                </label>
                            )
                        }
                    </label>

                    <label className="form-control w-full">
                        <span className="form-label">Tipo de servicio</span>
                        <select
                            className="form-input"
                            value={categoriaId}
                            onChange={(e) => setCategoriaId(e.target.value)}
                        >
                            <option value="">Selecciona una categoría</option>
                            {categorias.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.nombre}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="form-control w-full">
                        <span className="form-label">Descripción de la falla</span>
                        <textarea
                            className="form-input h-24"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                        />
                    </label>

                    <label className="form-control w-full">
                        <span className="form-label">Fecha preferida</span>
                        <input
                            type="datetime-local"
                            className="form-input"
                            value={fechaProgramada}
                            onChange={(e) => setFechaProgramada(e.target.value)}
                        />
                    </label>

                    <button
                        type="submit"
                        className="btn-primary w-full py-3"
                        disabled={submitting}
                    >
                        {submitting ? (
                            <span className="loading loading-spinner loading-sm" />
                        ) : (
                            "Enviar Solicitud"
                        )}
                    </button>
                </form>
            </Card>
        </div>
    );
};

export default SolicitudServicio;