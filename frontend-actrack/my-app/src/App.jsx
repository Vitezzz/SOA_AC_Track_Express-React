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
import CompletarPerfil from "./pages/CompletarPerfil/CompletarPerfil.jsx";
import OrdenDetalle from "./pages/Ordenes/OrdenDetalle.jsx";
import EquipoDetalle from "./pages/Equipos/EquipoDetalle.jsx";
import NotificacionesPush from "./components/NotificacionesPush";

//Component
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicRoute from "./components/PublicRoute.jsx";

import DashboardCliente from "./pages/Dashboard/DashboardCliente.jsx"
import { AuthProvider } from "./context/AuthContext.jsx";

function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <div>
            <Navigation />
            <NotificacionesPush />
            <main>
              <Routes>
                <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
                <Route path="/misequipos" element={<ProtectedRoute><MisEquipos /></ProtectedRoute>}></Route>
                <Route path="/equipos/:id" element={<ProtectedRoute><EquipoDetalle /></ProtectedRoute>}></Route>
                <Route path="/pagos" element={<ProtectedRoute><Pagos /></ProtectedRoute>}></Route>
                <Route path="/ordenes" element={<ProtectedRoute><Ordenes /></ProtectedRoute>}></Route>
                <Route path="/ordenes/:id" element={<ProtectedRoute><OrdenDetalle /></ProtectedRoute>}></Route>
                <Route path="/cotizaciones" element={<ProtectedRoute><Cotizaciones /></ProtectedRoute>}></Route>
                <Route path="/SolicitudServicio" element={<ProtectedRoute><SolicitudServicio /></ProtectedRoute>}></Route>
                <Route path="/mi-dashboard" element={<ProtectedRoute><DashboardCliente /></ProtectedRoute>}></Route>
                <Route path="/completar-perfil" element={<ProtectedRoute><CompletarPerfil /></ProtectedRoute>}></Route>
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
