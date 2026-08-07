import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login/Login";
import Home from "./pages/Home/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import GestionOrdenes from "./pages/Ordenes/GestionOrdenes";
import EditarOrden from "./pages/Ordenes/EditarOrden";
import CrearOrden from "./pages/Ordenes/CrearOrden";
import ClientesEquipos from "./pages/Clientes/ClientesEquipos";
import DetalleCliente from "./pages/Clientes/DetalleCliente";
import ListaCotizaciones from "./pages/Cotizaciones/ListaCotizaciones";
import CrearCotizacion from "./pages/Cotizaciones/CrearCotizacion";
import ListaPagos from "./pages/Pagos/ListaPagos";
import CrearPago from "./pages/Pagos/CrearPago";
import ListaTecnicos from "./pages/Tecnicos/ListaTecnicos";
import CrearTecnico from "./pages/Tecnicos/CrearTecnico";
import EditarTecnico from "./pages/Tecnicos/EditarTecnico";
import ListaMantenimiento from "./pages/Mantenimiento/ListaMantenimiento";
import FormularioMantenimiento from "./pages/Mantenimiento/FormularioMantenimiento";
import ListaInventario from "./pages/Inventario/ListaInventario";
import FormularioInventario from "./pages/Inventario/FormularioInventario";
import RegistrarMovimiento from "./pages/Inventario/RegistrarMovimiento";
import Configuracion from "./pages/Configuracion/Configuracion";
import CrearEquipo from "./pages/Clientes/CrearEquipo";
import EditarEquipo from "./pages/Clientes/EditarEquipo";
import EditarCotizacion from "./pages/Cotizaciones/EditarCotizacion";
import InventarioVehiculo from "./pages/Inventario/InventarioVehiculo";
import HistorialPagosTecnicos from "./pages/Pagos/HistorialPagosTecnicos";
import MapaEnVivo from "./pages/Rutas/MapaEnVivo";
import PlanificarRuta from "./pages/Rutas/PlanificarRuta";
import DashboardKPIs from "./pages/Reportes/DashboardKPIs";
import Reportes from "./pages/Reportes/Reportes";


function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <div className="app-shell">
          <Sidebar />
          <main className="app-content">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/ordenes" element={<ProtectedRoute><GestionOrdenes /></ProtectedRoute>} />
              <Route path="/ordenes/:id/editar" element={<ProtectedRoute><EditarOrden /></ProtectedRoute>} />
              <Route path="/ordenes/nueva" element={<ProtectedRoute><CrearOrden /></ProtectedRoute>} />
              <Route path="/clientes" element={<ProtectedRoute><ClientesEquipos /></ProtectedRoute>} />
              <Route path="/clientes/:id" element={<ProtectedRoute><DetalleCliente /></ProtectedRoute>} />
              <Route path="/cotizaciones" element={<ProtectedRoute><ListaCotizaciones /></ProtectedRoute>} />
              <Route path="/cotizaciones/nueva" element={<ProtectedRoute><CrearCotizacion /></ProtectedRoute>} />
              <Route path="/pagos" element={<ProtectedRoute><ListaPagos /></ProtectedRoute>} />
              <Route path="/pagos/nuevo" element={<ProtectedRoute><CrearPago /></ProtectedRoute>} />
              <Route path="/tecnicos" element={<ProtectedRoute><ListaTecnicos /></ProtectedRoute>} />
              <Route path="/tecnicos/nuevo" element={<ProtectedRoute roles={[2]}><CrearTecnico /></ProtectedRoute>} />
              <Route path="/tecnicos/:id/editar" element={<ProtectedRoute><EditarTecnico /></ProtectedRoute>} />
              <Route path="/mantenimiento" element={<ProtectedRoute><ListaMantenimiento /></ProtectedRoute>} />
              <Route path="/mantenimiento/nuevo" element={<ProtectedRoute><FormularioMantenimiento /></ProtectedRoute>} />
              <Route path="/mantenimiento/:id/editar" element={<ProtectedRoute><FormularioMantenimiento /></ProtectedRoute>} />
              <Route path="/inventario" element={<ProtectedRoute><ListaInventario /></ProtectedRoute>} />
              <Route path="/inventario/nuevo" element={<ProtectedRoute><FormularioInventario /></ProtectedRoute>} />
              <Route path="/inventario/:id/editar" element={<ProtectedRoute><FormularioInventario /></ProtectedRoute>} />
              <Route path="/inventario/movimiento" element={<ProtectedRoute><RegistrarMovimiento /></ProtectedRoute>} />
              <Route path="/inventario/vehiculos" element={<ProtectedRoute><InventarioVehiculo /></ProtectedRoute>} />
              <Route path="/configuracion" element={<ProtectedRoute><Configuracion /></ProtectedRoute>} />
              <Route path="/clientes/:id/equipos/nuevo" element={<ProtectedRoute><CrearEquipo /></ProtectedRoute>} />
              <Route path="/equipos/:id/editar" element={<ProtectedRoute><EditarEquipo /></ProtectedRoute>} />
              <Route path="/cotizaciones/:id/editar" element={<ProtectedRoute><EditarCotizacion /></ProtectedRoute>} />
              <Route path="/pagos/tecnicos" element={<ProtectedRoute><HistorialPagosTecnicos /></ProtectedRoute>} />
              <Route path="/rutas/mapa" element={<ProtectedRoute><MapaEnVivo /></ProtectedRoute>} />
              <Route path="/rutas/planificar" element={<ProtectedRoute><PlanificarRuta /></ProtectedRoute>} />
              <Route path="/reportes/dashboard" element={<ProtectedRoute><DashboardKPIs /></ProtectedRoute>} />
              <Route path="/reportes" element={<ProtectedRoute><Reportes /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;