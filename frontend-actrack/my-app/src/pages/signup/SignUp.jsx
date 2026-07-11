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
    <div className="flex justify-center items-center min-h-64">
      <Card>
        <form onSubmit={handleSubmit} className="card-body">
          <h1 className="card-title text-2xl justify-center">Registro</h1>
          <label className="form-control w-full">
            <span className="label-text">Nombre</span>
            <input
              type="text"
              name="nombre"
              className="input input-bordered w-full"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </label>
          <label className="form-control w-full">
            <span className="label-text">Apellido Paterno</span>
            <input
              type="text"
              name="paterno"
              className="input input-bordered w-full"
              value={formData.paterno}
              onChange={handleChange}
              required
            />
          </label>
          <label className="form-control w-full">
            <span className="label-text">Apellido Materno</span>
            <input
              type="text"
              name="materno"
              className="input input-bordered w-full"
              value={formData.materno}
              onChange={handleChange}
              required
            />
          </label>
          <label className="form-control w-full">
            <span className="label-text">Email</span>
            <input
              type="email"
              name="email"
              className="input input-bordered w-full"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>
          <label className="form-control w-full">
            <span className="label-text">Contraseña</span>
            <input
              type="password"
              name="password"
              className="input input-bordered w-full"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </label>
          { error && <p className="text-error text-sm mt-2">{error}</p>}
          <button type="submit" className="btn btn-primary mt-4">
            Registrarse
          </button>
          <label>
            Ya tienes cuenta? {" "}
            <Link to="/" className="text-primary hover:text-secondary">
            Inicia Sesión
            </Link>
          </label>
        </form>
      </Card>
    </div>
  );
};

export default SignUp;
