import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";
import Icon from "../../components/Icon.jsx";

const SignUp = () => {

  const [formData, setFormData] = useState({
    nombre: "",
    paterno: "",
    materno: "",
    email: "",
    password: "",
    telefono: "",
    direccion: "",
    rol_id: 3,
  })

  const [error, setError] = useState("")
  const { register } = useAuth();
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {

    e.preventDefault()
    setError("")

    try {
      await register(formData)
      navigate("/")
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-brand">
        <div className="auth-brand-content">
          <div className="brand text-white text-lg">
            <span className="brand-mark">AC</span>
            AC Track
          </div>
          <h2 className="text-3xl font-semibold mt-8 mb-3">Crea tu cuenta en minutos</h2>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>
            Regístrate para solicitar servicio, ver cotizaciones y llevar el historial de tus equipos.
          </p>
          <ul className="auth-features">
            <li className="auth-feature">
              <span className="auth-feature-icon"><Icon name="user" className="w-4 h-4" /></span>
              Un perfil para todas tus solicitudes
            </li>
            <li className="auth-feature">
              <span className="auth-feature-icon"><Icon name="wrench" className="w-4 h-4" /></span>
              Seguimiento de cada orden, paso a paso
            </li>
            <li className="auth-feature">
              <span className="auth-feature-icon"><Icon name="pin" className="w-4 h-4" /></span>
              Guarda tu dirección para agendar más rápido
            </li>
          </ul>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-card" style={{ maxWidth: "30rem" }}>
          <h1 className="page-title mb-1">Crear cuenta</h1>
          <p className="page-subtitle mb-6">Completa tus datos para empezar.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-section">
              <p className="form-section-title">
                <Icon name="user" /> Datos personales
              </p>
              <div className="space-y-4">
                <label className="form-control w-full">
                  <span className="form-label">Nombre</span>
                  <input
                    type="text"
                    name="nombre"
                    className="form-input"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                </label>
                <div className="form-grid-2">
                  <label className="form-control w-full">
                    <span className="form-label">Apellido paterno</span>
                    <input
                      type="text"
                      name="paterno"
                      className="form-input"
                      value={formData.paterno}
                      onChange={handleChange}
                      required
                    />
                  </label>
                  <label className="form-control w-full">
                    <span className="form-label">Apellido materno</span>
                    <input
                      type="text"
                      name="materno"
                      className="form-input"
                      value={formData.materno}
                      onChange={handleChange}
                      required
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="form-section">
              <p className="form-section-title">
                <Icon name="lock" /> Cuenta
              </p>
              <div className="space-y-4">
                <label className="form-control w-full">
                  <span className="form-label">Email</span>
                  <div className="input-group">
                    <Icon name="mail" className="input-icon" />
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      value={formData.email}
                      onChange={handleChange}
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
                      name="password"
                      className="form-input"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </label>
              </div>
            </div>

            <div className="form-section">
              <p className="form-section-title">
                <Icon name="pin" /> Contacto
              </p>
              <div className="form-grid-2">
                <label className="form-control w-full">
                  <span className="form-label">Teléfono</span>
                  <div className="input-group">
                    <Icon name="phone" className="input-icon" />
                    <input
                      type="tel"
                      name="telefono"
                      className="form-input"
                      value={formData.telefono}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </label>
                <label className="form-control w-full">
                  <span className="form-label">Dirección</span>
                  <div className="input-group">
                    <Icon name="pin" className="input-icon" />
                    <input
                      type="text"
                      name="direccion"
                      className="form-input"
                      value={formData.direccion}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </label>
              </div>
            </div>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="btn-primary w-full py-3">
              Registrarse
            </button>

            <p className="text-sm text-gray-500 text-center">
              Ya tienes cuenta?{" "}
              <Link to="/" className="font-medium hover:text-gray-600 transition-colors" style={{ color: "var(--color-accent)" }}>
                Inicia sesión
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
