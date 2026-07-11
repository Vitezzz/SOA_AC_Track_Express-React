//app.js set up your express app;
import cookieParser from 'cookie-parser';
import express from 'express';
import authRoutes from './routes/auth.js'
import rolesRoutes from './routes/roles.js'
import clientesRoutes from './routes/clientesRouter.js'
import marcasRoutes from './routes/marcaRoute.js'
import equiposRoute from './routes/equipos.js'
import categoriaServicioRoute from './routes/categoriaServicioRoute.js'
import categoriaInventarioRoute from './routes/categoriaInventarioRoute.js'
import inventarioRoute from './routes/inventarioRoute.js'
import movimientosInventarioRoute from './routes/movimientosInventarioRouter.js'
import prioridadRoutes from './routes/prioridadRouter.js'
import ordenesServicioRouter from './routes/ordenesServicioRouter.js'
import especialidadRoute from './routes/especialidadRoutes.js'
import tecnicosRoutes from './routes/tecnicosRoutes.js'
import tipoMovimientoInventario from './routes/tipoMovimientoInventarioRouter.js'
import bitacoraEstadosRouter from './routes/bitacoraEstadosRoutes.js'
import cotizacionesRouter from './routes/cotizacionesRouter.js'
import cotizacionDetalleRouter from './routes/cotizacionDetalleRouter.js'
import pagosRouter from './routes/pagosRoutes.js'
import mantenimientoPreventivoRouter from './routes/mantenimientoPreventivoRouter.js'
import checklistPlantillasRouter from './routes/checklistPlantillasRouter.js'
import checklistItemsPlantillaRouter from './routes/checklistItemsPlantilla.js'
import checklistEjecucionRouter from './routes/checklistEjecucion.js'
import oauthCuentasRouter from './routes/oauth_cuentas.router.js'
import notificacionesRouter from './routes/notificaciones.router.js'
import rutasRouter from './routes/rutas.router.js'
import rutaParadasRouter from './routes/rutaParadas.router.js'
import './config/passport.js'
import passport from 'passport';
import cors from 'cors';

const app = express(); //create an express app

app.use(express.json());
app.use(cookieParser())
app.use(cors({
    origin: ['http://localhost:5173', 'capacitor://localhost', 'file://'],
    credentials: true
}))
app.use(passport.initialize())


app.use('/api/auth', authRoutes);
app.use('/api/roles/', rolesRoutes)
app.use('/api/clientes/', clientesRoutes);
app.use('/api/marcas/', marcasRoutes);
app.use('/api/equipos/', equiposRoute);
app.use('/api/categoriaServicio', categoriaServicioRoute);
app.use('/api/categoriaInventario', categoriaInventarioRoute);
app.use('/api/inventario', inventarioRoute);
app.use('/api/movimientos_inventario', movimientosInventarioRoute);
app.use('/api/prioridad', prioridadRoutes);
app.use('/api/ordenes_servicio', ordenesServicioRouter);
app.use('/api/especialidad', especialidadRoute);
app.use('/api/tecnicos', tecnicosRoutes);
app.use('/api/tipo_movimiento_inventario', tipoMovimientoInventario);
app.use('/api/bitacora_estados', bitacoraEstadosRouter);
app.use('/api/cotizaciones', cotizacionesRouter);
app.use('/api/cotizacion_detalle', cotizacionDetalleRouter);
app.use('/api/pagos', pagosRouter);
app.use('/api/mantenimiento_preventivo', mantenimientoPreventivoRouter);
app.use('/api/checklist_plantillas', checklistPlantillasRouter);
app.use('/api/checklist_items_plantilla', checklistItemsPlantillaRouter);
app.use('/api/checklist_ejecucion', checklistEjecucionRouter);
app.use('/api/oauth_cuentas', oauthCuentasRouter);
app.use('/api/notificaciones', notificacionesRouter);
app.use('/api/rutas', rutasRouter);
app.use('/api/ruta_paradas', rutaParadasRouter);

export default app;