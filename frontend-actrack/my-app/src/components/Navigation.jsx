import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Navigation = () => {

  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate("/")
  }

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
        {user?.rol_id === 3 && (
          <NavLink
            to="/misequipos"
            className={({ isActive }) =>
              isActive ? "btn btn-primary" : "btn btn-ghost text-base-content"
            }
          >
            Mis Equipos
          </NavLink>
        )}
        {
          [2, 4, 5].includes(user?.rol_id) && (
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? "btn btn-primary" : "btn btn-ghost text-base-content"
              }
            >
              Dashboard
            </NavLink>
          )
        }
        {
          user?.rol_id === 3 && (
            <NavLink
              to="/SolicitudServicio"
              className={({ isActive }) =>
                isActive ? "btn btn-primary" : "btn btn-ghost text-base-content"
              }
            >
              Solicitud de Servicio
            </NavLink>
          )
        }
        {
          [2, 3, 5].includes(user?.rol_id) && (
            <NavLink
              to="/cotizaciones"
              className={({ isActive }) =>
                isActive ? "btn btn-primary" : "btn btn-ghost text-base-content"
              }
            >
              Cotizaciones
            </NavLink>
          )
        }
        {
          [2, 3, 5].includes(user?.rol_id) && (
            <NavLink
              to="/pagos"
              className={({ isActive }) =>
                isActive ? "btn btn-primary" : "btn btn-ghost text-base-content"
              }
            >
              Pagos
            </NavLink>
          )
        }
        {
          [2, 3, 4, 5].includes(user?.rol_id) && (
            <NavLink
              to="/ordenes"
              className={({ isActive }) =>
                isActive ? "btn btn-primary" : "btn btn-ghost text-base-content"
              }
            >
              Ordenes
            </NavLink>
          )
        }
        {
          user && (
            <>
              <span className="mr-2 font-semibold">{user.nombre}</span>
              <button onClick={handleLogout} className="btn btn-error ml-auto">
                Cerrar Sesión
              </button>
            </>
          )
        }
      </div>
    </nav>
  );
};

export default Navigation;
