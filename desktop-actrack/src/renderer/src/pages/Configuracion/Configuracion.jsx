import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const PESTAÑAS = ["Categorías de Servicio", "Categorías de Inventario", "Checklists", "Roles"];

const Configuracion = () => {
    const { apiFetch, user } = useAuth();
    const [pestañaActiva, setPestañaActiva] = useState(PESTAÑAS[0]);

    const esAdmin = user?.rol_id === 2;
    const puedeEditarChecklist = user?.rol_id === 2 || user?.rol_id === 5;

    return (
        <div className="page">
            <Link to="/home" className="page-back">← Inicio</Link>
            <h2>Configuración</h2>

            <div className="tabs">
                {PESTAÑAS.map((p) => (
                    <button
                        key={p}
                        onClick={() => setPestañaActiva(p)}
                        className={pestañaActiva === p ? "tab active" : "tab"}
                    >
                        {p}
                    </button>
                ))}
            </div>

            {pestañaActiva === "Categorías de Servicio" && (
                <CatalogoSimple endpoint="/api/categoriaServicio" puedeEditar={esAdmin} />
            )}
            {pestañaActiva === "Categorías de Inventario" && (
                <CatalogoSimple endpoint="/api/categoriaInventario" puedeEditar={esAdmin} />
            )}
            {pestañaActiva === "Checklists" && (
                <ChecklistPlantillas apiFetch={apiFetch} puedeEditar={puedeEditarChecklist} />
            )}
            {pestañaActiva === "Roles" && <ListaRoles apiFetch={apiFetch} />}
        </div>
    );
};

// ---------- Catálogo genérico (solo id + nombre): sirve para
// categorías de servicio Y categorías de inventario, mismo formato ----------
const CatalogoSimple = ({ endpoint, puedeEditar }) => {
    const { apiFetch } = useAuth();
    const [items, setItems] = useState([]);
    const [nombreNuevo, setNombreNuevo] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const cargar = async () => {
        try {
            const res = await apiFetch(endpoint);
            if (res.status === 404) {
                setItems([]);
            } else if (!res.ok) {
                throw new Error("No se pudo cargar el catálogo");
            } else {
                setItems(await res.json());
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargar();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [endpoint]);

    const handleAgregar = async (e) => {
        e.preventDefault();
        if (!nombreNuevo.trim()) return;
        try {
            const res = await apiFetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre: nombreNuevo }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "No se pudo agregar");
            setNombreNuevo("");
            cargar();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEliminar = async (id) => {
        if (!window.confirm("¿Eliminar este elemento?")) return;
        try {
            const res = await apiFetch(`${endpoint}/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("No se pudo eliminar");
            setItems((prev) => prev.filter((i) => i.id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <p className="muted-text">Cargando...</p>;

    return (
        <div>
            {error && <p className="error-text">{error}</p>}

            {puedeEditar && (
                <form onSubmit={handleAgregar} className="form form-inline">
                    <input
                        value={nombreNuevo}
                        onChange={(e) => setNombreNuevo(e.target.value)}
                        placeholder="Nombre nuevo..."
                    />
                    <button type="submit" className="btn-primary">Agregar</button>
                </form>
            )}

            {items.length === 0 ? (
                <p className="muted-text">Sin elementos todavía.</p>
            ) : (
                <ul className="panel" style={{ padding: "0.5rem 1rem" }}>
                    {items.map((item) => (
                        <li key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0", borderBottom: "1px solid var(--color-border)" }}>
                            {item.nombre}
                            {puedeEditar && (
                                <button onClick={() => handleEliminar(item.id)} className="btn-sm btn-danger">
                                    Eliminar
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

// ---------- Checklists (necesita categoría de servicio ligada) ----------
const ChecklistPlantillas = ({ apiFetch, puedeEditar }) => {
    const [plantillas, setPlantillas] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [nombreNuevo, setNombreNuevo] = useState("");
    const [catIdNuevo, setCatIdNuevo] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const cargar = async () => {
        try {
            const [resPlantillas, resCategorias] = await Promise.all([
                apiFetch("/api/checklist_plantillas"),
                apiFetch("/api/categoriaServicio"),
            ]);

            if (resPlantillas.status === 404) {
                setPlantillas([]);
            } else if (!resPlantillas.ok) {
                throw new Error("No se pudieron cargar los checklists");
            } else {
                setPlantillas(await resPlantillas.json());
            }

            if (resCategorias.ok) setCategorias(await resCategorias.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargar();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAgregar = async (e) => {
        e.preventDefault();
        if (!nombreNuevo.trim() || !catIdNuevo) return;
        try {
            const res = await apiFetch("/api/checklist_plantillas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cat_id: Number(catIdNuevo), nombre: nombreNuevo, activo: true }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "No se pudo agregar");
            setNombreNuevo("");
            setCatIdNuevo("");
            cargar();
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <p className="muted-text">Cargando...</p>;

    const plantillasConCategoria = plantillas.map((p) => {
        const categoria = categorias.find((c) => c.id === p.cat_id);
        return { ...p, nombreCategoria: categoria?.nombre || "—" };
    });

    return (
        <div>
            {error && <p className="error-text">{error}</p>}

            {puedeEditar && (
                <form onSubmit={handleAgregar} className="form form-inline">
                    <select value={catIdNuevo} onChange={(e) => setCatIdNuevo(e.target.value)} style={{ flex: "0 0 auto", width: "auto" }}>
                        <option value="">Categoría...</option>
                        {categorias.map((c) => (
                            <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                    </select>
                    <input
                        value={nombreNuevo}
                        onChange={(e) => setNombreNuevo(e.target.value)}
                        placeholder="Nombre del checklist..."
                    />
                    <button type="submit" className="btn-primary">Agregar</button>
                </form>
            )}

            {plantillasConCategoria.length === 0 ? (
                <p className="muted-text">Sin checklists todavía.</p>
            ) : (
                <ul className="panel" style={{ padding: "0.5rem 1rem" }}>
                    {plantillasConCategoria.map((p) => (
                        <li key={p.id} style={{ padding: "0.5rem 0", borderBottom: "1px solid var(--color-border)" }}>
                            <strong>{p.nombre}</strong> — {p.nombreCategoria} {p.activo ? "" : "(inactivo)"}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

// ---------- Roles: solo lectura, es catálogo fijo de referencia ----------
const ListaRoles = ({ apiFetch }) => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await apiFetch("/api/roles/");
                if (res.ok) setRoles(await res.json());
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, [apiFetch]);

    if (loading) return <p className="muted-text">Cargando...</p>;

    return (
        <ul className="panel" style={{ padding: "0.5rem 1rem" }}>
            {roles.map((rol) => (
                <li key={rol.id} style={{ padding: "0.5rem 0", borderBottom: "1px solid var(--color-border)" }}>
                    {rol.nombre}
                </li>
            ))}
        </ul>
    );
};

export default Configuracion;