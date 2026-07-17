import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-8 py-24 text-center">
      <h1 className="text-7xl font-light text-gray-300 mb-4">404</h1>
      <p className="text-lg text-gray-500 mb-8">Page Not Found</p>
      <button className="btn-primary px-6" onClick={() => navigate("/")}>
        Go to Home Page
      </button>
    </div>
  );
};

export default NotFoundPage;
