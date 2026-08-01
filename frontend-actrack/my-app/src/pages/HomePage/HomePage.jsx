import { useNavigate } from "react-router-dom";

const HomePage = () => {

    const navigate = useNavigate();

    const goToDashBoard = () => navigate("/Dashboard")

    return (
      <div className="hero-shell">
        <div className="panel-hero">
          <span className="badge-status badge-status-success mb-4">Panel de servicio</span>
          <h1 className="text-4xl font-semibold text-gray-900 mb-3">Bienvenido a AC Track</h1>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Da seguimiento a tus órdenes, cotizaciones y equipos desde un solo lugar.
          </p>
          <button className="btn-primary px-6" onClick={goToDashBoard}>
            Ir al Dashboard
          </button>
        </div>
      </div>
    )
}

export default HomePage;