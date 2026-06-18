import { useNavigate } from "react-router-dom";

const HomePage = () => {

    const navigate = useNavigate();

    const goToDashBoard = () => navigate("/Dashboard")

    return (
        <div className="hero min-h-64 bg-base-200 rounded-box p-8">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="text-4xl font-bold mb-4">Home Page</h1>
              <button className="btn btn-primary" onClick={goToDashBoard}>Dashboard</button>
            </div>
          </div>
        </div>
    )
}

export default HomePage;