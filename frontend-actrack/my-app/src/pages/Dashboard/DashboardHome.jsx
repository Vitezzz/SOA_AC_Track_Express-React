import { Link } from "react-router-dom";
import Icon from "../../components/Icon";

const ENLACES = [
  { to: "/ordenes", icon: "wrench", label: "Órdenes de servicio", desc: "Consulta y da seguimiento a las órdenes activas." },
  { to: "/cotizaciones", icon: "tag", label: "Cotizaciones", desc: "Revisa las cotizaciones enviadas a los clientes." },
  { to: "/pagos", icon: "card", label: "Pagos", desc: "Historial de pagos registrados por orden." },
];

const DashboardHome = () => (
  <div>
    <h2 className="page-title mb-1" style={{ margin: 0 }}>Dashboard</h2>
    <p className="page-subtitle mb-6">Bienvenido de vuelta. Esto es lo que puedes revisar hoy.</p>

    <div className="grid gap-4 sm:grid-cols-2">
      {ENLACES.map((enlace) => (
        <Link key={enlace.to} to={enlace.to} className="panel quick-link-card">
          <span className="quick-link-icon"><Icon name={enlace.icon} /></span>
          <span>
            <span className="block font-medium text-gray-900">{enlace.label}</span>
            <span className="block text-sm text-gray-500 mt-0.5">{enlace.desc}</span>
          </span>
        </Link>
      ))}
    </div>
  </div>
);

export default DashboardHome;
