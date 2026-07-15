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
    const [descripcion, setDescripcion] = useState("");
    const [fechaProgramada, setFechaProgramada] = useState("");

    // Estados de control de la pantalla
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [folioCreado, setFolioCreado] = useState("");

    const { apiFetch } = useAuth();

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

        if (!equipoId || !categoriaId || !descripcion || !fechaProgramada) {
            setError("Completa todos los campos antes de continuar");
            return;
        }

        if (!prioridadNormal) {
            setError("Falta configurar la prioridad 'normal' en el catálogo");
            return;
        }

        setSubmitting(true);
        try {
            const res = await apiFetch("/api/ordenes_servicio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    equ_id: Number(equipoId),
                    cat_id: Number(categoriaId),
                    pri_id: prioridadNormal.id,
                    prioridad: "normal",
                    estatus: "pendiente",
                    descripcion,
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
            setFechaProgramada("");
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <p className="text-center mt-10">Cargando...</p>;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card>
                <h1 className="text-2xl font-semibold text-gray-900 text-center mb-6">
                    Solicitar Servicio
                </h1>

                {folioCreado && (
                    <p className="text-green-600 text-sm text-center mb-4">
                        ¡Solicitud creada! Tu folio es <strong>{folioCreado}</strong>
                    </p>
                )}
                {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <label className="form-control w-full">
                        <span className="text-sm font-medium text-gray-700 mb-1 block">Equipo</span>
                        <select
                            className="input input-bordered w-full rounded-lg border-gray-200"
                            value={equipoId}
                            onChange={(e) => setEquipoId(e.target.value)}
                        >
                            <option value="">Selecciona un equipo</option>
                            {equipos.map((eq) => (
                                <option key={eq.id} value={eq.id}>
                                    {eq.tipo} — {eq.modelo} ({eq.numero_serie})
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="form-control w-full">
                        <span className="text-sm font-medium text-gray-700 mb-1 block">Tipo de servicio</span>
                        <select
                            className="input input-bordered w-full rounded-lg border-gray-200"
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
                        <span className="text-sm font-medium text-gray-700 mb-1 block">Descripción de la falla</span>
                        <textarea
                            className="input input-bordered w-full rounded-lg border-gray-200 h-24"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                        />
                    </label>

                    <label className="form-control w-full">
                        <span className="text-sm font-medium text-gray-700 mb-1 block">Fecha preferida</span>
                        <input
                            type="datetime-local"
                            className="input input-bordered w-full rounded-lg border-gray-200"
                            value={fechaProgramada}
                            onChange={(e) => setFechaProgramada(e.target.value)}
                        />
                    </label>

                    <button
                        type="submit"
                        className="btn w-full bg-gray-900 text-white hover:bg-gray-800 border-none rounded-lg py-3"
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