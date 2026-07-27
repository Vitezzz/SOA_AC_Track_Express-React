import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const enlaces = [
    { to: "/home", label: "Inicio", icono: "🏠" },
    { to: "/ordenes", label: "Órdenes", icono: "📋" },
    { to: "/clientes", label: "Clientes y Equipos", icono: "👥" },
    { to: "/cotizaciones", label: "Cotizaciones", icono: "💲" },
    { to: "/pagos", label: "Pagos", icono: "💳" },
    { to: "/tecnicos", label: "Técnicos", icono: "🔧" },
    { to: "/mantenimiento", label: "Mantenimiento", icono: "🗓️" },
];

const estiloLink = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 16px",
    borderRadius: "8px",
    textDecoration: "none",
    color: isActive ? "#111827" : "#6b7280",
    background: isActive ? "#f3f4f6" : "transparent",
    fontWeight: isActive ? "600" : "400",
});

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (!user) return null;

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <aside
            style={{
                width: "220px",
                minHeight: "100vh",
                borderRight: "1px solid #e5e7eb",
                display: "flex",
                flexDirection: "column",
                padding: "16px 8px",
                boxSizing: "border-box",
            }}
        >
            <div style={{ padding: "8px 16px", fontWeight: "bold", fontSize: "18px", marginBottom: "16px" }}>
                AC Track
            </div>

            <nav style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
                {enlaces.map((enlace) => (
                    <NavLink key={enlace.to} to={enlace.to} style={estiloLink}>
                        <span>{enlace.icono}</span>
                        <span>{enlace.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "12px", marginTop: "12px" }}>
                <p style={{ padding: "0 16px", fontSize: "13px", color: "#6b7280", marginBottom: "8px" }}>
                    {user.nombre}
                </p>
                <button onClick={handleLogout} style={{ width: "100%", padding: "8px" }}>
                    Cerrar sesión
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;