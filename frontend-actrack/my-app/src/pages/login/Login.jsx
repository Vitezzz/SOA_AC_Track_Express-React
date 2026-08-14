import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from '../../context/AuthContext.jsx'
import Icon from "../../components/Icon.jsx";
import Logo from "../../components/Logo.jsx";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  //Navigate
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password)
      navigate("/home");
    } catch (err) {
      setError(err.message)
      console.log('Error:', err.message)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-brand">
        <div className="auth-brand-content">
          <div className="brand text-white text-lg">
            <span className="brand-mark">
              <Logo className="w-4 h-4" />
            </span>
            AC Track
          </div>
          <h2 className="text-3xl font-semibold mt-8 mb-3">Todo tu servicio, en un solo lugar</h2>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>
            Da seguimiento a tus solicitudes, cotizaciones y equipos sin llamadas ni papeleo.
          </p>
          <ul className="auth-features">
            <li className="auth-feature">
              <span className="auth-feature-icon"><Icon name="wrench" className="w-4 h-4" /></span>
              Solicita y rastrea órdenes de servicio en tiempo real
            </li>
            <li className="auth-feature">
              <span className="auth-feature-icon"><Icon name="tag" className="w-4 h-4" /></span>
              Aprueba cotizaciones desde tu cuenta
            </li>
            <li className="auth-feature">
              <span className="auth-feature-icon"><Icon name="calendar" className="w-4 h-4" /></span>
              Consulta el historial y mantenimiento de tus equipos
            </li>
          </ul>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-card">
          <h1 className="page-title mb-1">Iniciar sesión</h1>
          <p className="page-subtitle mb-6">Ingresa tus datos para continuar.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="form-control w-full">
              <span className="form-label">Email</span>
              <div className="input-group">
                <Icon name="mail" className="input-icon" />
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </label>
            <label className="form-control w-full">
              <span className="form-label">Contraseña</span>
              <div className="input-group">
                <Icon name="lock" className="input-icon" />
                <input
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </label>

            {error && <p className="form-error">{error}</p>}

            <button
              type="submit"
              className="btn-primary w-full py-3"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                "Ingresar"
              )}
            </button>

            <p className="auth-divider">o continúa con</p>

            <div className="space-y-3">
              <a href="/api/auth/google" className="btn-secondary w-full py-3">Iniciar sesión con Google</a>
              <a href="/api/auth/facebook" className="btn-secondary w-full py-3">Iniciar sesión con Facebook</a>
            </div>

            <p className="text-sm text-gray-500 text-center pt-2">
              No tienes una cuenta?{" "}
              <Link to="/signup" className="font-medium hover:text-gray-600 transition-colors" style={{ color: "var(--color-accent)" }}>
                Regístrate aquí
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
