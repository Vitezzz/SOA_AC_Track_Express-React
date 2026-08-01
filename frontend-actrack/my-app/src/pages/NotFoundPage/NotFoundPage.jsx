import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="hero-shell text-center">
      <p className="text-sm font-medium mb-3" style={{ color: "var(--color-accent)" }}>AC Track</p>
      <h1 className="text-7xl font-light text-gray-300 mb-4">404</h1>
      <p className="text-lg text-gray-500 mb-8">Página no encontrada</p>
      <button className="btn-primary px-6" onClick={() => navigate("/")}>
        Volver al inicio
      </button>
    </div>
  );
};

export default NotFoundPage;
