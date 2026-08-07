import { useState, useEffect } from "react";
import { Card } from "../../components/Card";
import { useAuth } from "../../context/AuthContext";
import Icon from "../../components/Icon";
import LoadingState from "../../components/LoadingState";

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

        // La descripción de la falla es opcional -- no todos los servicios
        // parten de un problema (p.ej. mantenimiento preventivo programado).
        if (!equipoId || !categoriaId || !fechaProgramada) {
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

    if (loading) return <LoadingState />;

    return (
        <div className="page-shell">
            <Card maxWidth="max-w-xl">
                <div className="text-center mb-6">
                    <h1 className="page-title mb-1">Solicitar servicio</h1>
                    <p className="page-subtitle mb-0">Cuéntanos qué equipo necesita atención y cuándo te viene bien.</p>
                </div>

                {folioCreado && (
                    <p className="form-success mb-4">
                        ¡Solicitud creada! Tu folio es <strong>{folioCreado}</strong>
                    </p>
                )}
                {error && <p className="form-error mb-4">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="form-section">
                        <p className="form-section-title">
                            <Icon name="wrench" /> Equipo
                        </p>
                        <label className="form-control w-full">
                            <span className="form-label">Equipo a revisar</span>
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
                        </label>
                        {
                            equipoId === "otro" && (
                                <label className="form-control w-full mt-4">
                                    <span className="form-label">Describe tu equipo</span>
                                    <textarea
                                        className="form-input h-20"
                                        value={descripcionEquipo}
                                        onChange={(e) => setDescripcionEquipo(e.target.value)}
                                        placeholder="Ej. Split de pared Mirage, blanco, en la sala"
                                    />
                                </label>
                            )
                        }
                    </div>

                    <div className="form-section">
                        <p className="form-section-title">
                            <Icon name="note" /> Detalles del servicio
                        </p>
                        <div className="space-y-4">
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
                                <span className="form-label">Descripción de la falla (opcional)</span>
                                <textarea
                                    className="form-input h-24"
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    placeholder="Si es mantenimiento programado y no hay ninguna falla, puedes dejarlo en blanco"
                                />
                            </label>
                        </div>
                    </div>

                    <div className="form-section">
                        <p className="form-section-title">
                            <Icon name="calendar" /> Programación
                        </p>
                        <label className="form-control w-full">
                            <span className="form-label">Fecha preferida</span>
                            <input
                                type="datetime-local"
                                className="form-input"
                                value={fechaProgramada}
                                onChange={(e) => setFechaProgramada(e.target.value)}
                            />
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary w-full py-3"
                        disabled={submitting}
                    >
                        {submitting ? (
                            <span className="loading loading-spinner loading-sm" />
                        ) : (
                            "Enviar solicitud"
                        )}
                    </button>
                </form>
            </Card>
        </div>
    );
};

export default SolicitudServicio;