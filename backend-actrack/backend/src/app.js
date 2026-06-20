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

const app = express(); //create an express app

app.use(express.json());
app.use(cookieParser())

app.use('/api/auth', authRoutes);
app.use('/api/roles/', rolesRoutes)
app.use('/api/clientes/', clientesRoutes);
app.use('/api/marcas/', marcasRoutes);
app.use('/api/equipos/',equiposRoute);
app.use('/api/categoriaServicio', categoriaServicioRoute);
app.use('/api/categoriaInventario', categoriaInventarioRoute);
app.use('/api/inventario', inventarioRoute);
app.use('/api/movimientos_inventario', movimientosInventarioRoute);
app.use('/api/prioridad', prioridadRoutes);
app.use('/api/ordenes_servicio', ordenesServicioRouter);
app.use('/api/especialidad', especialidadRoute);

export default app;