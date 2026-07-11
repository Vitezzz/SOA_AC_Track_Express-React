import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login/Login.jsx";
import SignUp from "./pages/signup/SignUp.jsx";
import HomePage from "./pages/HomePage/HomePage.jsx";
import Navigation from "./components/Navigation.jsx";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage.jsx";
import Cotizaciones from "./pages/cotizaciones/Cotizaciones.jsx";
import MisEquipos from "./pages/Equipos/MisEquipos.jsx";
import Pagos from "./pages/Pagos/Pagos.jsx";
import Ordenes from "./pages/Ordenes/Ordenes.jsx";
import SolicitudServicio from "./pages/SolicitudServicio/SolicitudServicio.jsx"

//Component
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import DashboardLayout from "./pages/Dashboard/DashboardLayout.jsx";
import DashboardHome from "./pages/Dashboard/DashboardHome.jsx";
import DashboardDetails from "./pages/Dashboard/DashboardDetails.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <div>
            <Navigation />
            <main>
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/misequipos" element={<ProtectedRoute><MisEquipos /></ProtectedRoute>}></Route>
                <Route path="/pagos" element={<ProtectedRoute><Pagos /></ProtectedRoute>}></Route>
                <Route path="/ordenes" element={<ProtectedRoute><Ordenes /></ProtectedRoute>}></Route>
                <Route path="/cotizaciones" element={<ProtectedRoute><Cotizaciones /></ProtectedRoute>}></Route>
                <Route path="/SolicitudServicio" element={<ProtectedRoute><SolicitudServicio /></ProtectedRoute>}></Route>
                <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                  <Route index element={<DashboardHome />} />
                  <Route path="details" element={<DashboardDetails />} />
                </Route>
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;
