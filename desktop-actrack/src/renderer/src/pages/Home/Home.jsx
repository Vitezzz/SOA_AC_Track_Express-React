import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Icon from "../../components/Icon";

const ENLACES = [
    { to: "/ordenes", icono: "list", label: "Órdenes de servicio", desc: "Da seguimiento y asigna técnicos a las órdenes activas." },
    { to: "/clientes", icono: "users", label: "Clientes y equipos", desc: "Consulta clientes, sus equipos y su historial." },
    { to: "/cotizaciones", icono: "tag", label: "Cotizaciones", desc: "Crea y envía cotizaciones a los clientes." },
    { to: "/pagos", icono: "card", label: "Pagos", desc: "Registra y consulta pagos de órdenes." },
    { to: "/tecnicos", icono: "wrench", label: "Técnicos", desc: "Gestiona disponibilidad y especialidades." },
    { to: "/mantenimiento", icono: "calendar", label: "Mantenimiento", desc: "Programa visitas preventivas por equipo." },
    { to: "/inventario", icono: "box", label: "Inventario", desc: "Controla stock y movimientos de refacciones." },
];

const Home = () => {
    const { user } = useAuth();

    return (
        <div className="page">
            <h1 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>Bienvenido, {user?.nombre}</h1>
            <p className="muted-text">Usa el menú de la izquierda o los accesos rápidos para navegar entre los módulos.</p>

            <div className="quick-links">
                {ENLACES.map((enlace) => (
                    <Link key={enlace.to} to={enlace.to} className="quick-link-card">
                        <span className="quick-link-icon"><Icon name={enlace.icono} /></span>
                        <span>
                            <span className="quick-link-label">{enlace.label}</span>
                            <span className="quick-link-desc">{enlace.desc}</span>
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Home;
