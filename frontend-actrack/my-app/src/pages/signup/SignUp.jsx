import { Card } from "../../components/Card.jsx";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";

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
    <div className="page-shell">
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <h1 className="page-title text-center">Crear Cuenta</h1>
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
          <label className="form-control w-full">
            <span className="form-label">Apellido Paterno</span>
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
            <span className="form-label">Apellido Materno</span>
            <input
              type="text"
              name="materno"
              className="form-input"
              value={formData.materno}
              onChange={handleChange}
              required
            />
          </label>
          <label className="form-control w-full">
            <span className="form-label">Email</span>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>
          <label className="form-control w-full">
            <span className="form-label">Contraseña</span>
            <input
              type="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </label>
          <label className="form-control w-full">
            <span className="form-label">Teléfono</span>
            <input
              type="tel"
              name="telefono"
              className="form-input"
              value={formData.telefono}
              onChange={handleChange}
              required
            />
          </label>
          <label className="form-control w-full">
            <span className="form-label">Dirección</span>
            <input
              type="text"
              name="direccion"
              className="form-input"
              value={formData.direccion}
              onChange={handleChange}
              required
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn-primary w-full py-3">
            Registrarse
          </button>
          <label className="block text-sm text-gray-500 text-center">
            Ya tienes cuenta?{" "}
            <Link to="/" className="text-gray-900 font-medium hover:text-gray-600 transition-colors">
              Inicia Sesión
            </Link>
          </label>
        </form>
      </Card>
    </div>
  );
};

export default SignUp;
