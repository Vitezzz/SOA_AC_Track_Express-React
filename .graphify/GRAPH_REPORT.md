# Graph Report - .  (2026-08-11)

## Corpus Check
- 249 files · ~105,352 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 790 nodes · 1320 edges · 51 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.65)
- Token cost: 0 input · 0 output
- Edge kinds: contains: 574 · imports: 547 · imports_from: 141 · references: 40 · calls: 15 · conceptually_related_to: 2 · semantically_similar_to: 1


## Input Scope
- Requested: auto
- Resolved: committed (source: default-auto)
- Included files: 249 · Candidates: 466
- Excluded: 1 untracked · 80939 ignored · 1 sensitive · 3 missing committed
- Recommendation: Use --scope all or graphify.yaml inputs.corpus for a knowledge-base folder.

## Graph Freshness
- Built from Git commit: `0a79b98`
- Compare this hash to `git rev-parse HEAD` before trusting freshness-sensitive graph output.
## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 56 edges
2. `protect()` - 32 edges
3. `authorize()` - 25 edges
4. `ORDENES_SERVICIO` - 12 edges
5. `getClienteIdByUserId()` - 11 edges
6. `getClienteById()` - 10 edges
7. `USUARIOS` - 9 edges
8. `selectOrdenesServicioById()` - 9 edges
9. `puedeVerTodo()` - 9 edges
10. `findUserById()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Desktop renderer CSP (OSM + OSRM whitelisted)` --semantically_similar_to--> `Web app entry HTML (Google Maps JS API)`  [INFERRED] [semantically similar]
  desktop-actrack/src/renderer/index.html → frontend-actrack/my-app/index.html
- `Vite dev proxy note (frontend.md)` --conceptually_related_to--> `Web app README (Vite template)`  [INFERRED]
  frontend.md → frontend-actrack/my-app/README.md
- `Electron Builder config` --conceptually_related_to--> `Desktop README (setup docs)`  [INFERRED]
  desktop-actrack/electron-builder.yml → desktop-actrack/README.md

## Communities

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (43): getBitacoraEstados(), getBitacoraEstadosById(), getBitacoraPorOrden(), postBitacoraEstados(), dltOrdenesServicio(), getOrdenesServicio(), getOrdenesServicioById(), postOrdenesServicio() (+35 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (27): getHistorialOrden(), postBitacoraEstado(), getClienteById(), getEquipoById(), actualizarOrden(), getMisOrdenes(), getOrdenById(), getParadasDeRuta() (+19 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (37): getChecklistEjecucion(), postChecklistEjecucion(), putChecklistEjecucion(), validarItemXorDesc(), dltChecklistItemsPlantillaById(), getChecklistItemsPlantilla(), getChecklistItemsPlantillaById(), postChecklistItemsPlantilla() (+29 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (38): getProfile(), login(), logout(), refresh(), register(), dltOauthCuentas(), getOauthCuentas(), getOauthCuentasById() (+30 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (34): dltCotizacionDetalle(), getCotizacionDetalle(), getCotizacionDetalleById(), postCotizacionDetalleById(), putCotizacionDetalleById(), devolverAlAlmacen(), getInventarioVehiculo(), transferirAVehiculo() (+26 more)

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (23): getPrioridad(), getPrioridadById(), registrarToken(), allRoles(), idRol(), getTipoMovimientoInventario(), getTipoMovimientoInventarioById(), protect() (+15 more)

### Community 6 - "Community 6"
Cohesion: 0.08
Nodes (5): AuthContext, AuthProvider(), iconoTecnico, __dirname, __filename

### Community 7 - "Community 7"
Cohesion: 0.10
Nodes (23): dltCategoriaInventario(), getCategoriaInventario(), getCategoriaInventarioById(), postCategoriaInventario(), putCategoriaInventario(), dltInventario(), getInventario(), getInventarioById() (+15 more)

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (23): categoriaServicioById(), categoriaServicioDelete(), crearCategoriaServicio(), listadoCategoriaServicio(), putCategoriaServicio(), createMarca(), listadoMarcas(), marcaById() (+15 more)

### Community 9 - "Community 9"
Cohesion: 0.17
Nodes (27): BITACORA_ESTADOS, CATEGORIA_INVENTARIO, CATEGORIA_SERVICIO, CHECKLIST_EJECUCION, CHECKLIST_ITEMS_PLANTILLA, CHECKLIST_PLANTILLAS, CLIENTES, COTIZACION_DETALLE (+19 more)

### Community 10 - "Community 10"
Cohesion: 0.12
Nodes (21): dltRutaParadas(), getRutaParadasByRutaId(), postRutaParadas(), putRutaParadas(), dltRutas(), getRutas(), getRutasById(), postRutas() (+13 more)

### Community 11 - "Community 11"
Cohesion: 0.12
Nodes (20): getEspecialidad(), getEspecialidadById(), dltTecnicos(), getDisponibilidadTecnicos(), getTecnicos(), getTecnicosById(), getTecnicosTodos(), postTecnicos() (+12 more)

### Community 12 - "Community 12"
Cohesion: 0.14
Nodes (18): dltCotizaciones(), getCotizacioneById(), getCotizaciones(), postCotizacione(), putCotizaciones(), deleteCotizaciones(), generarSiguienteFolioCotizacion(), insertCotizaciones() (+10 more)

### Community 13 - "Community 13"
Cohesion: 0.10
Nodes (3): styles, useAuth(), ESTILOS_ESTADO

### Community 14 - "Community 14"
Cohesion: 0.13
Nodes (7): Card(), COLORES_PASTEL, DashboardCliente(), formatoMoneda(), NOMBRES_MES, ESTILOS_ESTADO_PAGO, NIVELES_PRIORIDAD

### Community 15 - "Community 15"
Cohesion: 0.12
Nodes (5): PATHS, enlaces, ENLACES, ENLACES_CLIENTE, ENLACES_OTROS

### Community 16 - "Community 16"
Cohesion: 0.20
Nodes (14): allClientes(), clienteById(), clienteDelete(), clienteUpdate(), completarPerfil(), crearCliente(), verMiPerfil(), completarPerfilCliente() (+6 more)

### Community 17 - "Community 17"
Cohesion: 0.18
Nodes (7): actualizarDisponibilidad(), getMiTecnico(), actualizarMiPerfil(), getMiPerfil(), styles, usePushRegistration(), useUbicacionEnVivo()

### Community 18 - "Community 18"
Cohesion: 0.21
Nodes (13): actualizarEquipo(), crearEquipo(), eliminarEquipo(), equiposById(), listaEquipos(), createEquipo(), deleteEquipo(), getEquipoById() (+5 more)

### Community 19 - "Community 19"
Cohesion: 0.21
Nodes (13): dltMantenimientoPreventivo(), getMantenimientoPreventivo(), getMantenimientoPreventivoById(), postGenerarVencidos(), postMantenimientoPreventivo(), putMantenimientoPreventivo(), deleteMantenimientoPreventivo(), insertMantenimientoPreventivo() (+5 more)

### Community 20 - "Community 20"
Cohesion: 0.23
Nodes (11): dltNotificaciones(), getNotificaciones(), getNotificacionesById(), postNotificaciones(), putNotificaciones(), deleteNotificaciones(), insertNotificaciones(), selectNotificaciones() (+3 more)

### Community 21 - "Community 21"
Cohesion: 0.21
Nodes (7): ETIQUETAS, FILTROS, formatearFecha(), TarjetaOrden(), ETAPAS_ORDEN, indiceProgreso(), ordenEstaActiva()

### Community 22 - "Community 22"
Cohesion: 0.18
Nodes (9): app, __dirname, escucharMensajesEnPrimerPlano(), __filename, firebaseApp, firebaseConfig, messaging, pedirPermisoYObtenerToken() (+1 more)

### Community 23 - "Community 23"
Cohesion: 0.36
Nodes (6): actualizarEjecucion(), crearEjecucion(), getEjecucionesOrden(), getItemsPlantilla(), getPlantillasChecklist(), styles

### Community 24 - "Community 24"
Cohesion: 0.22
Nodes (3): PESTAÑAS, PESTAÑAS_BASE, ROLES_CREABLES

### Community 25 - "Community 25"
Cohesion: 0.31
Nodes (6): fechaHoy(), horaActual(), iconoParada, PlanificarRuta(), UBICACION_BASE, calcularRutaOptima()

### Community 26 - "Community 26"
Cohesion: 0.39
Nodes (5): getCatalogoInventario(), getInventarioVehiculo(), getTiposMovimiento(), registrarMovimiento(), styles

### Community 27 - "Community 27"
Cohesion: 0.29
Nodes (5): httpServer, initSocket(), origenesFijos, origenLanPermitido(), origenPermitido()

### Community 28 - "Community 28"
Cohesion: 0.33
Nodes (1): PESTAÑAS

### Community 30 - "Community 30"
Cohesion: 0.40
Nodes (2): ESTILOS_ESTADO, FILTROS

### Community 31 - "Community 31"
Cohesion: 0.50
Nodes (3): destino, inicio, socket

### Community 32 - "Community 32"
Cohesion: 0.50
Nodes (1): iconoPin

### Community 33 - "Community 33"
Cohesion: 0.50
Nodes (1): ESTILOS_ESTADO

### Community 34 - "Community 34"
Cohesion: 0.67
Nodes (3): EquipoDetalle(), ESTILOS_ESTADO, formatearFecha()

### Community 35 - "Community 35"
Cohesion: 0.50
Nodes (1): ESTILOS_ESTADO

### Community 36 - "Community 36"
Cohesion: 0.83
Nodes (3): formatearFechaHora(), formatoMoneda(), OrdenDetalle()

### Community 37 - "Community 37"
Cohesion: 0.50
Nodes (1): NOMBRES_MES

### Community 38 - "Community 38"
Cohesion: 0.50
Nodes (1): ESTILOS_ESTADO

### Community 39 - "Community 39"
Cohesion: 0.50
Nodes (1): COLORES

### Community 40 - "Community 40"
Cohesion: 1.00
Nodes (2): EditarCotizacion(), formatoMoneda()

### Community 41 - "Community 41"
Cohesion: 1.00
Nodes (2): CHECKLIST_EJECUCION, CHECKLIST_ITEMS_PLANTILLA

### Community 42 - "Community 42"
Cohesion: 0.67
Nodes (1): NIVELES_PRIORIDAD

### Community 43 - "Community 43"
Cohesion: 0.67
Nodes (1): ESTADOS_POSIBLES

### Community 44 - "Community 44"
Cohesion: 1.00
Nodes (2): CrearPago(), formatoMoneda()

### Community 46 - "Community 46"
Cohesion: 1.00
Nodes (1): pool

### Community 47 - "Community 47"
Cohesion: 1.00
Nodes (2): Desktop renderer CSP (OSM + OSRM whitelisted), Web app entry HTML (Google Maps JS API)

### Community 48 - "Community 48"
Cohesion: 1.00
Nodes (2): Desktop README (setup docs), Electron Builder config

### Community 49 - "Community 49"
Cohesion: 1.00
Nodes (2): Vite dev proxy note (frontend.md), Web app README (Vite template)

### Community 52 - "Community 52"
Cohesion: 1.00
Nodes (1): api

### Community 53 - "Community 53"
Cohesion: 1.00
Nodes (1): messaging

### Community 56 - "Community 56"
Cohesion: 1.00
Nodes (1): Archivo de cookies capturado (formato Netscape)

## Knowledge Gaps
- **104 isolated node(s):** `socket`, `inicio`, `destino`, `__filename`, `__dirname` (+99 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 28`** (1 nodes): `PESTAÑAS`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (2 nodes): `ESTILOS_ESTADO`, `FILTROS`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (1 nodes): `iconoPin`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (1 nodes): `ESTILOS_ESTADO`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (1 nodes): `ESTILOS_ESTADO`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (1 nodes): `NOMBRES_MES`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (1 nodes): `ESTILOS_ESTADO`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (1 nodes): `COLORES`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (2 nodes): `EditarCotizacion()`, `formatoMoneda()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (2 nodes): `CHECKLIST_EJECUCION`, `CHECKLIST_ITEMS_PLANTILLA`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (1 nodes): `NIVELES_PRIORIDAD`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (1 nodes): `ESTADOS_POSIBLES`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (2 nodes): `CrearPago()`, `formatoMoneda()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (1 nodes): `pool`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (2 nodes): `Desktop renderer CSP (OSM + OSRM whitelisted)`, `Web app entry HTML (Google Maps JS API)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (2 nodes): `Desktop README (setup docs)`, `Electron Builder config`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (2 nodes): `Vite dev proxy note (frontend.md)`, `Web app README (Vite template)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (1 nodes): `api`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (1 nodes): `messaging`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (1 nodes): `Archivo de cookies capturado (formato Netscape)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `protect()` connect `Community 5` to `Community 3`, `Community 0`, `Community 7`, `Community 8`, `Community 2`, `Community 16`, `Community 4`, `Community 12`, `Community 18`, `Community 11`, `Community 19`, `Community 20`, `Community 10`?**
  _High betweenness centrality (0.108) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `Community 13` to `Community 1`, `Community 17`, `Community 15`, `Community 6`, `Community 14`, `Community 24`, `Community 40`, `Community 33`, `Community 34`, `Community 35`, `Community 23`, `Community 26`, `Community 42`, `Community 43`, `Community 30`, `Community 36`, `Community 21`, `Community 44`, `Community 37`, `Community 38`, `Community 39`, `Community 28`, `Community 25`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `authorize()` connect `Community 2` to `Community 0`, `Community 7`, `Community 8`, `Community 16`, `Community 4`, `Community 12`, `Community 18`, `Community 19`, `Community 20`, `Community 3`, `Community 10`, `Community 11`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **What connects `socket`, `inicio`, `destino` to the rest of the system?**
  _104 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06328320802005012 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05660377358490566 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.0603921568627451 - nodes in this community are weakly interconnected._