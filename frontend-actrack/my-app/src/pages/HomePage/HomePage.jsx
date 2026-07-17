import { useNavigate } from "react-router-dom";

const HomePage = () => {

    const navigate = useNavigate();

    const goToDashBoard = () => navigate("/Dashboard")

    return (
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="panel-hero">
          <h1 className="text-4xl font-semibold text-gray-900 mb-6">Home Page</h1>
          <button className="btn-primary px-6" onClick={goToDashBoard}>
            Dashboard
          </button>
        </div>
      </div>
    )
}

export default HomePage;