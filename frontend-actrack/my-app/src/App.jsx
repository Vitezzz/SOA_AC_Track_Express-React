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
//Component

import DashboardLayout from "./pages/Dashboard/DashboardLayout.jsx";
import DashboardHome from "./pages/Dashboard/DashboardHome.jsx";
import DashboardDetails from "./pages/Dashboard/DashboardDetails.jsx";

function App() {
  return (
    <>
      <BrowserRouter>
        <div>
          <Navigation />
          <main>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="*" element={<NotFoundPage />} />
              <Route path="/misequipos" element={<MisEquipos />}></Route>
              <Route path="/pagos" element={<Pagos />}></Route>
              <Route path="/ordenes" element={<Ordenes />}></Route>
              <Route path="/cotizaciones" element={<Cotizaciones />}></Route>
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardHome/>} />
                <Route path="details" element={<DashboardDetails/>} />
              </Route>
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </>
  );
}

export default App;
