import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Navigation = () => {

  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Sin sesión no hay nada útil que navegar (todos los links son por rol
  // o rebotan por ProtectedRoute) -- así que en Login/SignUp no se muestra
  // la barra en absoluto, en vez de una versión vacía a medias.
  if (!user) return null;

  const handleLogout = async () => {
    await logout()
    navigate("/")
  }

  return (
    <nav className="site-nav mb-6">
      <div className="flex items-center max-w-7xl mx-auto">
        <NavLink to="/home" className="brand">
          <span className="brand-mark">AC</span>
          AC Track
        </NavLink>
        <div className="flex items-center gap-1 flex-1">
          <NavLink
            to="/home"
            className={({ isActive }) =>
              isActive ? "btn btn-ghost nav-link-active" : "btn btn-ghost nav-link"
            }
          >
            Home
          </NavLink>
          {user?.rol_id === 3 && (
            <NavLink
              to="/misequipos"
              className={({ isActive }) =>
                isActive ? "btn btn-ghost nav-link-active" : "btn btn-ghost nav-link"
              }
            >
              Mis Equipos
            </NavLink>
          )}
          {user?.rol_id === 3 && (
            <NavLink
              to="/mi-dashboard"
              className={({ isActive }) =>
                isActive ? "btn btn-ghost nav-link-active" : "btn btn-ghost nav-link"
              }
            >
              Mi Dashboard
            </NavLink>
          )}
          {
            user?.rol_id === 3 && (
              <NavLink
                to="/SolicitudServicio"
                className={({ isActive }) =>
                  isActive ? "btn btn-ghost nav-link-active" : "btn btn-ghost nav-link"
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
                  isActive ? "btn btn-ghost nav-link-active" : "btn btn-ghost nav-link"
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
                  isActive ? "btn btn-ghost nav-link-active" : "btn btn-ghost nav-link"
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
                  isActive ? "btn btn-ghost nav-link-active" : "btn btn-ghost nav-link"
                }
              >
                Ordenes
              </NavLink>
            )
          }
        </div>
        {
          user && (
            <div className="flex items-center gap-4 pl-6 border-l border-gray-200">
              <NavLink
                to="/completar-perfil"
                className={({ isActive }) =>
                  isActive ? "btn btn-ghost nav-link-active" : "btn btn-ghost nav-link"
                }>
                <span className="text-sm text-gray-600">{user.nombre}</span>

              </NavLink>
              <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
                Cerrar sesión
              </button>
            </div>
          )
        }
      </div>
    </nav>
  );
};

export default Navigation;
