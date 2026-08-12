import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Icon from "../../components/Icon";
import LoadingState from "../../components/LoadingState";

const PASOS = [
    { numero: 1, etiqueta: "Equipo" },
    { numero: 2, etiqueta: "Servicio" },
    { numero: 3, etiqueta: "Fecha" },
];

const formatearFechaLarga = (valor) => {
    if (!valor) return "—";
    return new Date(valor).toLocaleString("es-MX", {
        weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
    });
};

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
    const [paso, setPaso] = useState(1);
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

    const equipoSeleccionado = equipos.find((eq) => String(eq.id) === equipoId);
    const categoriaSeleccionada = categorias.find((cat) => String(cat.id) === categoriaId);

    const paso1Valido = equipoId !== "" && (equipoId !== "otro" || descripcionEquipo.trim() !== "");
    const paso2Valido = categoriaId !== "";

    const irASiguiente = () => {
        setError("");
        if (paso === 1 && !paso1Valido) {
            setError(equipoId === "" ? "Selecciona un equipo para continuar" : "Describe brevemente tu equipo");
            return;
        }
        if (paso === 2 && !paso2Valido) {
            setError("Selecciona qué tipo de servicio necesitas");
            return;
        }
        setPaso((p) => Math.min(p + 1, 3));
    };

    const irAAnterior = () => {
        setError("");
        setPaso((p) => Math.max(p - 1, 1));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setFolioCreado("");

        if (user.perfil_completo === false) {
            setError("Completa los datos de tu perfil antes de hacer una solicitud");
            return;
        }

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
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const reiniciar = () => {
        setEquipoId("");
        setCategoriaId("");
        setDescripcion("");
        setDescripcionEquipo("");
        setFechaProgramada("");
        setFolioCreado("");
        setPaso(1);
    };

    if (loading) return <LoadingState />;

    // Perfil incompleto: se avisa de una vez, en vez de dejar que llenen
    // los 3 pasos y se enteren hasta que le den "Enviar".
    if (user?.perfil_completo === false) {
        return (
            <div className="solicitud-shell">
                <div className="solicitud-container">
                    <div className="solicitud-alert">
                        <div className="solicitud-alert-icon">
                            <Icon name="alert" />
                        </div>
                        <h1 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
                            Completa tu perfil primero
                        </h1>
                        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                            Necesitamos tu dirección y datos de contacto antes de poder agendar un servicio.
                        </p>
                        <Link to="/completar-perfil" className="btn-primary mt-2">
                            Completar mi perfil
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (folioCreado) {
        return (
            <div className="solicitud-shell">
                <div className="solicitud-container">
                    <div className="success-panel">
                        <div className="success-icon">
                            <Icon name="check" />
                        </div>
                        <h1 className="text-xl font-semibold" style={{ color: "var(--color-text)" }}>
                            ¡Solicitud enviada!
                        </h1>
                        <p className="text-sm mt-2" style={{ color: "var(--color-text-muted)" }}>
                            Un técnico revisará tu solicitud y te avisaremos en cuanto quede confirmada.
                        </p>
                        <span className="success-folio">{folioCreado}</span>
                        <div className="success-actions">
                            <Link to="/" className="btn-secondary">Volver al inicio</Link>
                            <button type="button" className="btn-primary" onClick={reiniciar}>
                                Hacer otra solicitud
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="solicitud-shell">
            <div className="solicitud-container">
                <div className="solicitud-hero">
                    <div className="solicitud-hero-icon">
                        <Icon name="wrench" />
                    </div>
                    <h1 className="page-title mb-1">Solicitar servicio</h1>
                    <p className="page-subtitle mb-0">Cuéntanos qué equipo necesita atención y cuándo te viene bien.</p>
                </div>

                <div className="stepper">
                    {PASOS.map((p, i) => {
                        const estado = p.numero < paso ? "done" : p.numero === paso ? "active" : "pending";
                        return (
                            <div key={p.numero} style={{ display: "contents" }}>
                                <div className={`stepper-step ${estado === "active" ? "stepper-step-active" : ""} ${estado === "done" ? "stepper-step-done" : ""}`}>
                                    <div className="stepper-circle">
                                        {estado === "done" ? <Icon name="check" /> : p.numero}
                                    </div>
                                    <span className="stepper-step-label">{p.etiqueta}</span>
                                </div>
                                {i < PASOS.length - 1 && (
                                    <div className={`stepper-line ${p.numero < paso ? "stepper-line-done" : ""}`} />
                                )}
                            </div>
                        );
                    })}
                </div>

                {error && <p className="form-error mb-4">{error}</p>}

                <form onSubmit={handleSubmit} className="solicitud-panel">
                    {paso === 1 && (
                        <>
                            <h2 className="solicitud-step-title">¿Qué equipo necesita servicio?</h2>
                            <p className="solicitud-step-subtitle">Elige uno de tus equipos registrados, o describe uno nuevo.</p>

                            <div className="option-grid">
                                {equipos.map((eq) => {
                                    const seleccionado = equipoId === String(eq.id);
                                    return (
                                        <button
                                            type="button"
                                            key={eq.id}
                                            className={`option-card ${seleccionado ? "option-card-selected" : ""}`}
                                            onClick={() => setEquipoId(String(eq.id))}
                                        >
                                            <span className="option-card-icon"><Icon name="box" /></span>
                                            <span>
                                                <span className="option-card-title block">{eq.tipo}</span>
                                                <span className="option-card-subtitle block">{eq.modelo} · {eq.numero_serie}</span>
                                            </span>
                                            {seleccionado && (
                                                <span className="option-card-check"><Icon name="check" /></span>
                                            )}
                                        </button>
                                    );
                                })}

                                <button
                                    type="button"
                                    className={`option-card ${equipoId === "otro" ? "option-card-selected" : ""}`}
                                    onClick={() => setEquipoId("otro")}
                                >
                                    <span className="option-card-icon"><Icon name="note" /></span>
                                    <span>
                                        <span className="option-card-title block">Otro equipo</span>
                                        <span className="option-card-subtitle block">No está en la lista</span>
                                    </span>
                                    {equipoId === "otro" && (
                                        <span className="option-card-check"><Icon name="check" /></span>
                                    )}
                                </button>
                            </div>

                            {equipoId === "otro" && (
                                <label className="form-control w-full mt-4">
                                    <span className="form-label">Describe tu equipo</span>
                                    <textarea
                                        className="form-input h-20"
                                        value={descripcionEquipo}
                                        onChange={(e) => setDescripcionEquipo(e.target.value)}
                                        placeholder="Ej. Split de pared Mirage, blanco, en la sala"
                                    />
                                </label>
                            )}
                        </>
                    )}

                    {paso === 2 && (
                        <>
                            <h2 className="solicitud-step-title">¿Qué tipo de servicio necesitas?</h2>
                            <p className="solicitud-step-subtitle">Y si quieres, cuéntanos qué está pasando.</p>

                            <div className="option-grid">
                                {categorias.map((cat) => {
                                    const seleccionada = categoriaId === String(cat.id);
                                    return (
                                        <button
                                            type="button"
                                            key={cat.id}
                                            className={`option-card ${seleccionada ? "option-card-selected" : ""}`}
                                            onClick={() => setCategoriaId(String(cat.id))}
                                        >
                                            <span className="option-card-icon"><Icon name="tag" /></span>
                                            <span className="option-card-title">{cat.nombre}</span>
                                            {seleccionada && (
                                                <span className="option-card-check"><Icon name="check" /></span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <label className="form-control w-full mt-4">
                                <span className="form-label">Descripción de la falla (opcional)</span>
                                <textarea
                                    className="form-input h-24"
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    placeholder="Si es mantenimiento programado y no hay ninguna falla, puedes dejarlo en blanco"
                                />
                            </label>
                        </>
                    )}

                    {paso === 3 && (
                        <>
                            <h2 className="solicitud-step-title">¿Cuándo te viene bien?</h2>
                            <p className="solicitud-step-subtitle">Es la fecha y hora que prefieres -- la confirmamos contigo.</p>

                            <label className="form-control w-full mb-5">
                                <span className="form-label">Fecha y hora preferida</span>
                                <input
                                    type="datetime-local"
                                    className="form-input"
                                    value={fechaProgramada}
                                    onChange={(e) => setFechaProgramada(e.target.value)}
                                />
                            </label>

                            <div className="summary-card">
                                <div className="summary-row">
                                    <span className="summary-row-label">Equipo</span>
                                    <span className="summary-row-value">
                                        {equipoId === "otro" ? descripcionEquipo : `${equipoSeleccionado?.tipo} — ${equipoSeleccionado?.modelo}`}
                                    </span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-row-label">Servicio</span>
                                    <span className="summary-row-value">{categoriaSeleccionada?.nombre}</span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-row-label">Fecha</span>
                                    <span className="summary-row-value">{formatearFechaLarga(fechaProgramada)}</span>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="wizard-nav">
                        {paso > 1 ? (
                            <button type="button" className="btn-secondary" onClick={irAAnterior}>
                                <Icon name="chevron-left" className="w-4 h-4" /> Atrás
                            </button>
                        ) : <span />}

                        {paso < 3 ? (
                            <button type="button" className="btn-primary" onClick={irASiguiente}>
                                Continuar
                            </button>
                        ) : (
                            <button type="submit" className="btn-primary" disabled={submitting || !fechaProgramada}>
                                {submitting ? <span className="loading loading-spinner loading-sm" /> : "Enviar solicitud"}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SolicitudServicio;
