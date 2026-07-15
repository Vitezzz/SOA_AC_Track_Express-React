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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <h1 className="text-2xl font-semibold text-gray-900 text-center mb-6">Crear Cuenta</h1>
          <label className="form-control w-full">
            <span className="text-sm font-medium text-gray-700 mb-1 block">Nombre</span>
            <input
              type="text"
              name="nombre"
              className="input input-bordered w-full rounded-lg border-gray-200 focus:border-gray-400 focus:ring-0"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </label>
          <label className="form-control w-full">
            <span className="text-sm font-medium text-gray-700 mb-1 block">Apellido Paterno</span>
            <input
              type="text"
              name="paterno"
              className="input input-bordered w-full rounded-lg border-gray-200 focus:border-gray-400 focus:ring-0"
              value={formData.paterno}
              onChange={handleChange}
              required
            />
          </label>
          <label className="form-control w-full">
            <span className="text-sm font-medium text-gray-700 mb-1 block">Apellido Materno</span>
            <input
              type="text"
              name="materno"
              className="input input-bordered w-full rounded-lg border-gray-200 focus:border-gray-400 focus:ring-0"
              value={formData.materno}
              onChange={handleChange}
              required
            />
          </label>
          <label className="form-control w-full">
            <span className="text-sm font-medium text-gray-700 mb-1 block">Email</span>
            <input
              type="email"
              name="email"
              className="input input-bordered w-full rounded-lg border-gray-200 focus:border-gray-400 focus:ring-0"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>
          <label className="form-control w-full">
            <span className="text-sm font-medium text-gray-700 mb-1 block">Contraseña</span>
            <input
              type="password"
              name="password"
              className="input input-bordered w-full rounded-lg border-gray-200 focus:border-gray-400 focus:ring-0"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </label>
          <label className="form-control w-full">
            <span className="text-sm font-medium text-gray-700 mb-1 block">Teléfono</span>
            <input
              type="tel"
              name="telefono"
              className="input input-bordered w-full rounded-lg border-gray-200 focus:border-gray-400 focus:ring-0"
              value={formData.telefono}
              onChange={handleChange}
              required
            />
          </label>
          <label className="form-control w-full">
            <span className="text-sm font-medium text-gray-700 mb-1 block">Dirección</span>
            <input
              type="text"
              name="direccion"
              className="input input-bordered w-full rounded-lg border-gray-200 focus:border-gray-400 focus:ring-0"
              value={formData.direccion}
              onChange={handleChange}
              required
            />
          </label>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button type="submit" className="btn w-full bg-gray-900 text-white hover:bg-gray-800 border-none rounded-lg py-3">
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
