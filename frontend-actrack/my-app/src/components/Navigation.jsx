import { NavLink } from "react-router-dom";

const Navigation = () => {
  return (
    <nav className="navbar bg-base-100 text-base-content shadow-sm mb-4">
      <div className="flex gap-2">
        <NavLink
          to="/home"
          className={({ isActive }) =>
            isActive ? "btn btn-primary" : "btn btn-ghost text-base-content"
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/misequipos"
          className={({ isActive }) =>
            isActive ? "btn btn-primary" : "btn btn-ghost text-base-content"
          }
        >
          Mis Equipos
        </NavLink>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? "btn btn-primary" : "btn btn-ghost text-base-content"
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/SolicitudServicio"
          className={({ isActive }) =>
            isActive ? "btn btn-primary" : "btn btn-ghost text-base-content"
          }
        >
          Solicitud de Servicio
        </NavLink>
        <NavLink
          to="/cotizaciones"
          className={({ isActive }) =>
            isActive ? "btn btn-primary" : "btn btn-ghost text-base-content"
          }
        >
          Cotizaciones
        </NavLink>
        <NavLink
          to="/pagos"
          className={({ isActive }) =>
            isActive ? "btn btn-primary" : "btn btn-ghost text-base-content"
          }
        >
          Pagos
        </NavLink>
        <NavLink
          to="/ordenes"
          className={({ isActive }) =>
            isActive ? "btn btn-primary" : "btn btn-ghost text-base-content"
          }
        >
          Ordenes
        </NavLink>
      </div>
    </nav>
  );
};

export default Navigation;
