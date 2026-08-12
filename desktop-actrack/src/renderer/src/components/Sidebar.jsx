import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Icon from "./Icon";
import NotificationBell from "./NotificationBell";

const enlaces = [
    { to: "/home", label: "Inicio", icono: "home" },
    { to: "/ordenes", label: "Órdenes", icono: "list" },
    { to: "/clientes", label: "Clientes y Equipos", icono: "users" },
    { to: "/cotizaciones", label: "Cotizaciones", icono: "tag" },
    { to: "/pagos", label: "Pagos", icono: "card" },
    { to: "/tecnicos", label: "Técnicos", icono: "wrench" },
    { to: "/mantenimiento", label: "Mantenimiento", icono: "calendar" },
    { to: "/inventario", label: "Inventario", icono: "box" },
    { to: "/rutas/mapa", label: "Mapa en Vivo", icono: "map" },
    { to: "/rutas/planificar", label: "Planificar Rutas", icono: "route" },
    { to: "/reportes/dashboard", label: "Dashboard KPIs", icono: "chart" },
    { to: "/reportes", label: "Reportes", icono: "file" },
    { to: "/configuracion", label: "Configuración", icono: "settings" },
];

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (!user) return null;

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <span className="sidebar-brand-mark">AC</span>
                AC Track
                <NotificationBell />
            </div>

            <nav className="sidebar-nav">
                {enlaces.map((enlace) => (
                    <NavLink
                        key={enlace.to}
                        to={enlace.to}
                        className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
                    >
                        <Icon name={enlace.icono} />
                        <span>{enlace.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <p className="sidebar-user">{user.nombre}</p>
                <button onClick={handleLogout} className="btn-sm" style={{ width: "100%" }}>
                    Cerrar sesión
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
