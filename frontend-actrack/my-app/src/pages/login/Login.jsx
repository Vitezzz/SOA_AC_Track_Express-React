import { Card } from "../../components/Card.jsx";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const mockFetch = async (url, options) => {
  console.log("Simulacion de peticion de ", url, " con datos: ", options.body);

  //Simulación de retraso de red
  await new Promise((resolve) => setTimeout(resolve, 800));

  const data = JSON.parse(options.body);

  //Simulación de login exitoso
  if (data.email === "test@test.com" && data.password === "1234") {
    return {
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        token: "fake-jwt-token-123",
        user: { id: 1, email: "test@test.com", nombre: "User" },
      }),
    };
  }
  return {
    ok: false,
    status: 401,
    json: async () => ({ success: false, message: "Credenciales incorrectas" }),
  };
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  //Naviagte

  const navigate = useNavigate();

  const goToHome = () => navigate("/home");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await mockFetch("https://localhost:5173/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Credenciales incorrectas");
      }

      //Guardamos el token en localStorage para persistir la sesión
      localStorage.setItem("token", data.token);
      console.log("login exitoso");
      goToHome();
    } catch (err) {
      setError(err.message);
      console.log("Credenciales incorrectas:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-64">
      <Card>
        <form onSubmit={handleSubmit} className="card-body">
          <h1 className="card-title text-2xl justify-center">Login</h1>
          <label className="form-control w-full">
            <span className="label-text">Email</span>
            <input
              type="email"
              className="input input-bordered w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="form-control w-full">
            <span className="label-text">Contraseña</span>
            <input
              type="password"
              className="input input-bordered w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <label>No tienes una cuenta? <Link to="/signup" className="text-primary hover:text-secondary transition-colors duration-200">Registrate aqui</Link></label>
          {error && <p className="text-error text-sm mt-2">{error}</p>}
          <button
            type="submit"
            className="btn btn-primary mt-4"
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner" />
            ) : (
              "Ingresar"
            )}
          </button>
        </form>
      </Card>
    </div>
  );
};

export default Login;
