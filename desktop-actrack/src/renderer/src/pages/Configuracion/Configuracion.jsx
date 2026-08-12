import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const PESTAÑAS_BASE = ["Categorías de Servicio", "Categorías de Inventario", "Checklists", "Roles"];

const Configuracion = () => {
    const { apiFetch, user } = useAuth();

    const esAdmin = user?.rol_id === 2;
    const puedeEditarChecklist = user?.rol_id === 2 || user?.rol_id === 5;

    // "Usuarios" (crear/activar cuentas de admin y supervisor) es exclusivo
    // de admin -- ni siquiera se muestra la pestaña para nadie más, el
    // backend de todos modos la rechazaría.
    const PESTAÑAS = esAdmin ? [...PESTAÑAS_BASE, "Usuarios"] : PESTAÑAS_BASE;
    const [pestañaActiva, setPestañaActiva] = useState(PESTAÑAS_BASE[0]);

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
            {pestañaActiva === "Usuarios" && esAdmin && (
                <UsuariosTab apiFetch={apiFetch} miPropioId={user.id} />
            )}
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

// ---------- Usuarios: crear cuentas de admin/supervisor y activar o
// desactivar cualquier cuenta -- técnico y cliente tienen su propio flujo
// de alta en otro lado, aquí solo viven los dos roles que no tienen dónde
// más nacer. ----------
const ROLES_CREABLES = [
    { id: 2, nombre: "Admin" },
    { id: 5, nombre: "Supervisor" },
];

const UsuariosTab = ({ apiFetch, miPropioId }) => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [guardando, setGuardando] = useState(false);

    const [nombre, setNombre] = useState("");
    const [paterno, setPaterno] = useState("");
    const [materno, setMaterno] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rolId, setRolId] = useState("2");

    const cargar = async () => {
        try {
            const res = await apiFetch("/api/usuarios");
            if (!res.ok) throw new Error("No se pudieron cargar los usuarios");
            setUsuarios(await res.json());
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

    const handleCrear = async (e) => {
        e.preventDefault();
        if (!nombre.trim() || !email.trim() || !password) return;

        setGuardando(true);
        setError("");
        try {
            const res = await apiFetch("/api/usuarios", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre, paterno, materno, email, password, rol_id: Number(rolId) }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "No se pudo crear el usuario");

            setNombre(""); setPaterno(""); setMaterno(""); setEmail(""); setPassword("");
            cargar();
        } catch (err) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    };

    const handleToggleActivo = async (usuario) => {
        const nuevoActivo = !(usuario.activo !== false);
        try {
            const res = await apiFetch(`/api/usuarios/${usuario.id}/activo`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ activo: nuevoActivo }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "No se pudo actualizar el usuario");
            setUsuarios((prev) => prev.map((u) => (u.id === usuario.id ? { ...u, activo: nuevoActivo } : u)));
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <p className="muted-text">Cargando...</p>;

    return (
        <div>
            {error && <p className="error-text">{error}</p>}

            <form onSubmit={handleCrear} className="form form-inline" style={{ flexWrap: "wrap", marginBottom: "16px" }}>
                <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre(s)" required />
                <input value={paterno} onChange={(e) => setPaterno(e.target.value)} placeholder="Apellido paterno" />
                <input value={materno} onChange={(e) => setMaterno(e.target.value)} placeholder="Apellido materno" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" required />
                <select value={rolId} onChange={(e) => setRolId(e.target.value)} style={{ flex: "0 0 auto", width: "auto" }}>
                    {ROLES_CREABLES.map((r) => (
                        <option key={r.id} value={r.id}>{r.nombre}</option>
                    ))}
                </select>
                <button type="submit" className="btn-primary" disabled={guardando}>
                    {guardando ? "Creando..." : "Crear cuenta"}
                </button>
            </form>

            <div className="table-wrap">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map((u) => {
                            const activo = u.activo !== false;
                            return (
                                <tr key={u.id}>
                                    <td>{[u.nombre, u.paterno, u.materno].filter(Boolean).join(" ")}</td>
                                    <td>{u.email}</td>
                                    <td>{u.rol_nombre}</td>
                                    <td>
                                        <span className={`badge ${activo ? "badge-success" : "badge-neutral"}`}>
                                            {activo ? "Activo" : "Desactivado"}
                                        </span>
                                    </td>
                                    <td>
                                        {u.id === miPropioId ? (
                                            <span className="muted-text" style={{ fontSize: "12px" }}>Esta es tu cuenta</span>
                                        ) : (
                                            <button className="btn-sm" onClick={() => handleToggleActivo(u)}>
                                                {activo ? "Desactivar" : "Activar"}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Configuracion;