import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="hero min-h-64 bg-base-200 rounded-box p-8">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-6xl font-bold text-error">404</h1>
          <p className="text-lg mt-2">Page Not Found</p>
          <button className="btn btn-primary mt-4" onClick={() => navigate("/")}>
            Go to Home Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
