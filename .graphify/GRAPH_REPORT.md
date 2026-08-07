# Graph Report - .  (2026-08-07)

## Corpus Check
- 167 files · ~53,610 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 612 nodes · 1037 edges · 44 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.65)
- Token cost: 0 input · 0 output
- Edge kinds: imports: 455 · contains: 448 · imports_from: 82 · references: 39 · calls: 10 · conceptually_related_to: 2 · semantically_similar_to: 1


## Input Scope
- Requested: tracked
- Resolved: tracked (source: cli)
- Included files: 167 · Candidates: 219
- Excluded: 244 untracked · 80937 ignored · 0 sensitive · 2 missing committed
- Recommendation: Use --scope all or graphify.yaml inputs.corpus for a knowledge-base folder.
## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 40 edges
2. `protect()` - 29 edges
3. `authorize()` - 23 edges
4. `ORDENES_SERVICIO` - 12 edges
5. `getClienteIdByUserId()` - 11 edges
6. `getClienteById()` - 10 edges
7. `USUARIOS` - 9 edges
8. `selectOrdenesServicioById()` - 9 edges
9. `puedeVerTodo()` - 9 edges
10. `getTecnicoIdByUserId()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Desktop renderer CSP (OSM + OSRM whitelisted)` --semantically_similar_to--> `Web app entry HTML (Google Maps JS API)`  [INFERRED] [semantically similar]
  desktop-actrack/src/renderer/index.html → frontend-actrack/my-app/index.html
- `Vite dev proxy note (frontend.md)` --conceptually_related_to--> `Web app README (Vite template)`  [INFERRED]
  frontend.md → frontend-actrack/my-app/README.md
- `Electron Builder config` --conceptually_related_to--> `Desktop README (setup docs)`  [INFERRED]
  desktop-actrack/electron-builder.yml → desktop-actrack/README.md

## Communities

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (42): getBitacoraEstados(), getBitacoraEstadosById(), getBitacoraPorOrden(), postBitacoraEstados(), dltOrdenesServicio(), getOrdenesServicio(), getOrdenesServicioById(), postOrdenesServicio() (+34 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (31): getChecklistEjecucion(), postChecklistEjecucion(), putChecklistEjecucion(), validarItemXorDesc(), dltChecklistItemsPlantillaById(), getChecklistItemsPlantilla(), getChecklistItemsPlantillaById(), postChecklistItemsPlantilla() (+23 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (27): getProfile(), login(), logout(), refresh(), register(), dltOauthCuentas(), getOauthCuentas(), getOauthCuentasById() (+19 more)

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (5): enlaces, AuthContext, AuthProvider(), __dirname, __filename

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (21): devolverAlAlmacen(), getInventarioVehiculo(), transferirAVehiculo(), dltMovimientosInventario(), getMovimientosInventario(), getMovimientosInventarioId(), postMovimientosInventario(), putMovimientosInventario() (+13 more)

### Community 5 - "Community 5"
Cohesion: 0.17
Nodes (27): BITACORA_ESTADOS, CATEGORIA_INVENTARIO, CATEGORIA_SERVICIO, CHECKLIST_EJECUCION, CHECKLIST_ITEMS_PLANTILLA, CHECKLIST_PLANTILLAS, CLIENTES, COTIZACION_DETALLE (+19 more)

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (21): dltRutaParadas(), getRutaParadasByRutaId(), postRutaParadas(), putRutaParadas(), dltRutas(), getRutas(), getRutasById(), postRutas() (+13 more)

### Community 7 - "Community 7"
Cohesion: 0.12
Nodes (20): getEspecialidad(), getEspecialidadById(), dltTecnicos(), getDisponibilidadTecnicos(), getTecnicos(), getTecnicosById(), getTecnicosTodos(), postTecnicos() (+12 more)

### Community 8 - "Community 8"
Cohesion: 0.10
Nodes (16): getPrioridad(), getPrioridadById(), getTipoMovimientoInventario(), getTipoMovimientoInventarioById(), protect(), selectPrioridad(), selectPrioridadById(), selectTipoMovimientoInventario() (+8 more)

### Community 9 - "Community 9"
Cohesion: 0.14
Nodes (18): dltCotizaciones(), getCotizacioneById(), getCotizaciones(), postCotizacione(), putCotizaciones(), deleteCotizaciones(), generarSiguienteFolioCotizacion(), insertCotizaciones() (+10 more)

### Community 10 - "Community 10"
Cohesion: 0.11
Nodes (4): PATHS, ENLACES, ENLACES, ESTILOS_ESTADO

### Community 11 - "Community 11"
Cohesion: 0.12
Nodes (2): useAuth(), ESTILOS_ESTADO

### Community 12 - "Community 12"
Cohesion: 0.20
Nodes (14): allClientes(), clienteById(), clienteDelete(), clienteUpdate(), completarPerfil(), crearCliente(), verMiPerfil(), completarPerfilCliente() (+6 more)

### Community 13 - "Community 13"
Cohesion: 0.21
Nodes (13): dltCotizacionDetalle(), getCotizacionDetalle(), getCotizacionDetalleById(), postCotizacionDetalleById(), putCotizacionDetalleById(), deleteCotizacionDetalle(), insertCotizacionDetalle(), selectCotizacionDetalle() (+5 more)

### Community 14 - "Community 14"
Cohesion: 0.21
Nodes (13): actualizarEquipo(), crearEquipo(), eliminarEquipo(), equiposById(), listaEquipos(), createEquipo(), deleteEquipo(), getEquipoById() (+5 more)

### Community 15 - "Community 15"
Cohesion: 0.20
Nodes (12): dltInventario(), getInventario(), getInventarioById(), postInventario(), putInventario(), deleteInventario(), generarSiguienteCodigoInventario(), insertInventario() (+4 more)

### Community 16 - "Community 16"
Cohesion: 0.21
Nodes (11): dltCategoriaInventario(), getCategoriaInventario(), getCategoriaInventarioById(), postCategoriaInventario(), putCategoriaInventario(), deleteCategoria_Inventario(), insertCategoria_Inventario(), selectAllCategoria_Inventario() (+3 more)

### Community 17 - "Community 17"
Cohesion: 0.22
Nodes (12): categoriaServicioById(), categoriaServicioDelete(), crearCategoriaServicio(), listadoCategoriaServicio(), putCategoriaServicio(), createCategoriaServicio(), deleteCategoriaServicio(), getCategoriaServicio() (+4 more)

### Community 18 - "Community 18"
Cohesion: 0.22
Nodes (12): dltMantenimientoPreventivo(), getMantenimientoPreventivo(), getMantenimientoPreventivoById(), postMantenimientoPreventivo(), putMantenimientoPreventivo(), deleteMantenimientoPreventivo(), insertMantenimientoPreventivo(), selectMantenimientoById() (+4 more)

### Community 19 - "Community 19"
Cohesion: 0.21
Nodes (11): createMarca(), listadoMarcas(), marcaById(), marcaDelete(), marcaUpdate(), crearMarca(), deleteMarca(), getMarcaId() (+3 more)

### Community 20 - "Community 20"
Cohesion: 0.23
Nodes (11): dltNotificaciones(), getNotificaciones(), getNotificacionesById(), postNotificaciones(), putNotificaciones(), deleteNotificaciones(), insertNotificaciones(), selectNotificaciones() (+3 more)

### Community 21 - "Community 21"
Cohesion: 0.17
Nodes (5): COLORES_PASTEL, DashboardCliente(), formatoMoneda(), NOMBRES_MES, ESTILOS_ESTADO_PAGO

### Community 22 - "Community 22"
Cohesion: 0.24
Nodes (5): allRoles(), idRol(), getRoles(), getRolesById(), router

### Community 23 - "Community 23"
Cohesion: 0.31
Nodes (2): Card(), NIVELES_PRIORIDAD

### Community 24 - "Community 24"
Cohesion: 0.33
Nodes (1): PESTAÑAS

### Community 25 - "Community 25"
Cohesion: 0.40
Nodes (3): FILTROS, formatearFecha(), TarjetaOrden()

### Community 27 - "Community 27"
Cohesion: 0.50
Nodes (1): ESTILOS_ESTADO

### Community 28 - "Community 28"
Cohesion: 0.67
Nodes (3): EquipoDetalle(), ESTILOS_ESTADO, formatearFecha()

### Community 29 - "Community 29"
Cohesion: 0.50
Nodes (1): ESTILOS_ESTADO

### Community 30 - "Community 30"
Cohesion: 0.83
Nodes (3): formatearFechaHora(), formatoMoneda(), OrdenDetalle()

### Community 31 - "Community 31"
Cohesion: 0.50
Nodes (1): NOMBRES_MES

### Community 32 - "Community 32"
Cohesion: 0.50
Nodes (1): ESTILOS_ESTADO

### Community 33 - "Community 33"
Cohesion: 0.67
Nodes (1): ETIQUETAS

### Community 34 - "Community 34"
Cohesion: 1.00
Nodes (2): EditarCotizacion(), formatoMoneda()

### Community 35 - "Community 35"
Cohesion: 0.67
Nodes (1): NIVELES_PRIORIDAD

### Community 36 - "Community 36"
Cohesion: 0.67
Nodes (1): ESTADOS_POSIBLES

### Community 37 - "Community 37"
Cohesion: 1.00
Nodes (2): CrearPago(), formatoMoneda()

### Community 40 - "Community 40"
Cohesion: 1.00
Nodes (1): pool

### Community 42 - "Community 42"
Cohesion: 1.00
Nodes (2): Desktop renderer CSP (OSM + OSRM whitelisted), Web app entry HTML (Google Maps JS API)

### Community 43 - "Community 43"
Cohesion: 1.00
Nodes (2): Desktop README (setup docs), Electron Builder config

### Community 44 - "Community 44"
Cohesion: 1.00
Nodes (2): Vite dev proxy note (frontend.md), Web app README (Vite template)

### Community 47 - "Community 47"
Cohesion: 1.00
Nodes (1): api

### Community 48 - "Community 48"
Cohesion: 1.00
Nodes (1): httpServer

### Community 51 - "Community 51"
Cohesion: 1.00
Nodes (1): Archivo de cookies capturado (formato Netscape)

## Knowledge Gaps
- **66 isolated node(s):** `__filename`, `__dirname`, `pool`, `httpServer`, `router` (+61 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 11`** (2 nodes): `useAuth()`, `ESTILOS_ESTADO`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (2 nodes): `Card()`, `NIVELES_PRIORIDAD`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (1 nodes): `PESTAÑAS`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (1 nodes): `ESTILOS_ESTADO`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (1 nodes): `ESTILOS_ESTADO`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (1 nodes): `NOMBRES_MES`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (1 nodes): `ESTILOS_ESTADO`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (1 nodes): `ETIQUETAS`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (2 nodes): `EditarCotizacion()`, `formatoMoneda()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (1 nodes): `NIVELES_PRIORIDAD`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (1 nodes): `ESTADOS_POSIBLES`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (2 nodes): `CrearPago()`, `formatoMoneda()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (1 nodes): `pool`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (2 nodes): `Desktop renderer CSP (OSM + OSRM whitelisted)`, `Web app entry HTML (Google Maps JS API)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (2 nodes): `Desktop README (setup docs)`, `Electron Builder config`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (2 nodes): `Vite dev proxy note (frontend.md)`, `Web app README (Vite template)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (1 nodes): `api`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (1 nodes): `httpServer`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (1 nodes): `Archivo de cookies capturado (formato Netscape)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `protect()` connect `Community 8` to `Community 2`, `Community 0`, `Community 16`, `Community 17`, `Community 1`, `Community 12`, `Community 13`, `Community 9`, `Community 14`, `Community 7`, `Community 15`, `Community 4`, `Community 18`, `Community 19`, `Community 20`, `Community 22`, `Community 6`?**
  _High betweenness centrality (0.147) - this node is a cross-community bridge._
- **Why does `authorize()` connect `Community 1` to `Community 0`, `Community 16`, `Community 17`, `Community 12`, `Community 13`, `Community 9`, `Community 14`, `Community 15`, `Community 4`, `Community 18`, `Community 19`, `Community 20`, `Community 2`, `Community 6`, `Community 7`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Why does `selectOrdenesServicioById()` connect `Community 0` to `Community 1`, `Community 9`, `Community 4`, `Community 6`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **What connects `__filename`, `__dirname`, `pool` to the rest of the system?**
  _66 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.07926829268292683 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.08558558558558559 - nodes in this community are weakly interconnected._