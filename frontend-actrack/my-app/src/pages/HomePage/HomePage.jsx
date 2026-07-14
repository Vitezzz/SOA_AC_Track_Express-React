import { useNavigate } from "react-router-dom";

const HomePage = () => {

    const navigate = useNavigate();

    const goToDashBoard = () => navigate("/Dashboard")

    return (
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <h1 className="text-4xl font-semibold text-gray-900 mb-6">Home Page</h1>
          <button className="btn bg-gray-900 text-white hover:bg-gray-800 border-none rounded-lg px-6" onClick={goToDashBoard}>
            Dashboard
          </button>
        </div>
      </div>
    )
}

export default HomePage;