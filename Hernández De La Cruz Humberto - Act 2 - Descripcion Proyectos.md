## **UNIVERSIDAD POLITÉCNICA DE CENTRO** 

Ingeniería en Software 

Asignatura: Arquitectura Orientada a Servicios 

## **AC Track** 

Sistema SOA de Coordinación Operativa, Logística y Mantenimiento para Servicio Técnico de Aire Acondicionado 

## **Actividad No. 2 – Descripción del Proyecto** 

Alumno: Humberto Hernández De La Cruz Maestro: Octavio Elias Sanchez Aquino 

Fecha límite de entrega: 20 de mayo de 2025 

## **1. Nombre del Proyecto** 

AC Track – Sistema SOA de Coordinación Operativa, Logística y Mantenimiento para Servicio Técnico de Aire Acondicionado. 

## **2. Descripción del Proyecto / Problemática a Resolver** 

Las empresas y técnicos independientes de mantenimiento de equipos de aire acondicionado en México gestionan actualmente su operación de manera manual: utilizan libretas, hojas de cálculo y aplicaciones de mensajería para coordinar citas, asignar técnicos, registrar diagnósticos y controlar el inventario de refacciones y refrigerantes. 

Esta forma de trabajar genera problemas graves y recurrentes: 

- Entrecruzamiento de visitas técnicas por falta de un calendario centralizado. 

- Retrasos en la atención al cliente por ausencia de refacciones clave en el almacén. 

- Rutas de campo ineficientes que elevan el consumo de combustible y el tiempo muerto. 

- Pérdida del historial técnico de los equipos, lo que impide un mantenimiento preventivo efectivo. 

- Dificultad para escalar el negocio, emitir cotizaciones formales y justificar precios ante el cliente. 

- Imposibilidad de generar reportes gerenciales para la toma de decisiones. 

AC Track centraliza toda la operación en tres aplicaciones interconectadas (escritorio, web y móvil) que cubren la gestión de órdenes de servicio, técnicos de campo, inventario, cotizaciones, pagos y análisis estadístico, bajo un enfoque de Arquitectura Orientada a Servicios (SOA). 

## **3. Justificación del Proyecto** 

El sector de mantenimiento de climatización en México es fragmentado y mayoritariamente operado por PyMES y técnicos independientes que carecen de herramientas digitales especializadas. La digitalización de sus procesos operativos representa una ventaja competitiva inmediata y cuantificable: • **Comunicación proactiva con el cliente:** La integración de Twilio SMS permite notificar al cliente automáticamente en cada etapa del servicio, reduciendo llamadas de seguimiento y aumentando la satisfacción hasta un 35 %. 

- **Trazabilidad y mantenimiento preventivo:** El historial digital de cada equipo permite predecir fallas, programar mantenimientos recurrentes y extender la vida útil del aire acondicionado. 

- **Análisis gerencial:** Los dashboards con gráficas de desempeño apoyan la toma de decisiones sobre contratación, compras y expansión del negocio. 

## **4. Objetivo General** 

Desarrollar un sistema de información bajo arquitectura SOA denominado AC Track, compuesto por tres aplicaciones (escritorio, web y móvil), que permita a empresas y técnicos de mantenimiento de equipos de aire acondicionado gestionar de forma centralizada, eficiente y trazable sus órdenes de servicio, recursos humanos, inventario, rutas de campo y cotizaciones, integrando al menos tres servicios externos (Google Maps Platform, Twilio SMS y Firebase Cloud Messaging) y un módulo de análisis estadístico para la toma de decisiones. 

## **5. Objetivos Específicos** 

- Diseñar e implementar una base de datos relacional en PostgreSQL que modele la operación completa de una empresa de mantenimiento de aire acondicionado. 

- Desarrollar una API RESTful con Node.js y Express que exponga los servicios de negocio consumidos por las tres aplicaciones cliente. 

- Implementar un módulo de autenticación unificado con soporte para credenciales propias y OAuth 2.0 (Google y Facebook) para las tres plataformas. 

- Crear una aplicación de escritorio para el administrador y supervisor, con gestión de catálogos, inventario, cotizaciones y reportes gerenciales. 

- Desarrollar una aplicación web progresiva orientada al cliente, que permita solicitar y dar seguimiento a órdenes de servicio, consultar el historial de sus equipos . 

- Construir una aplicación móvil (React Native) para el técnico de campo, que permita gestionar su agenda, consultar rutas optimizadas, ejecutar checklists de trabajo y registrar evidencias. 

- Integrar tres servicios externos: Google Maps Platform (ruteo y geolocalización), Twilio SMS API (notificaciones de texto al cliente) y Firebase Cloud Messaging (notificaciones push a dispositivos móviles y web). 

- Implementar un módulo de gráficas y dashboards en cada aplicación que apoye la toma de decisiones con indicadores clave de desempeño (KPI). 

- Garantizar la seguridad del sistema mediante HTTPS, JWT, refresh tokens y control de roles de acceso por tablas roles y usuarios. 

## **6. Marco Teórico** 

## **Node.js y Express** 

Node.js es un entorno de ejecución de JavaScript del lado del servidor basado en el motor V8, optimizado para aplicaciones I/O intensivas mediante su modelo de eventos no bloqueantes. Express es el framework web minimalista más utilizado sobre Node.js; proporciona un sistema de ruteo y middlewares que facilita la construcción de APIs RESTful. AC Track utiliza Express para construir la capa de servicios central que conecta la base de datos con las tres aplicaciones. 

## **React y React Native** 

React es una biblioteca de JavaScript desarrollada por Meta para construir interfaces de usuario basadas en componentes reutilizables y un DOM virtual. React Native extiende este paradigma al desarrollo móvil nativo (iOS y Android) utilizando los mismos conceptos de componentes. En AC Track, React se utiliza para la aplicación web y de escritorio, mientras que React Native impulsa la aplicación móvil del técnico. 

## **PostgreSQL** 

PostgreSQL es un sistema gestor de bases de datos objeto-relacional de código abierto, reconocido por su robustez, cumplimiento estricto del estándar SQL y soporte para tipos avanzados como UUID, JSONB y arreglos. AC Track utiliza PostgreSQL como DBMS principal , aprovechando la extensión uuid-ossp para la generación de identificadores únicos y definiendo todas las llaves foráneas de forma explícita. 

## **JWT y OAuth 2.0** 

JSON Web Token (JWT) es un estándar abierto (RFC 7519) para la transmisión segura de información entre partes como un objeto JSON firmado digitalmente. AC Track emite access tokens de corta duración y refresh tokens almacenados en la tabla sesiones para renovación segura. OAuth 2.0 permite delegar la autenticación a Google y Facebook, cuyos datos se persisten en la tabla oauth_cuentas. 

## **Google Maps Platform** 

Google Maps Platform es un conjunto de APIs de geolocalización que incluye Maps JavaScript API, Directions API y Geocoding API. En AC Track se utiliza para mostrar la posición en tiempo real de los técnicos (tabla tecnicos), calcular rutas optimizadas almacenadas en rutas y ruta_paradas, y geocodificar las direcciones de los clientes. 

## **Twilio SMS API** 

Twilio es una plataforma de comunicaciones en la nube que expone una API REST para el envío de mensajes SMS. Su SDK oficial para Node.js permite enviar mensajes programáticamente desde el servidor Express. En AC Track se usa para notificar al cliente en los momentos clave: confirmación de cita, aviso de técnico en camino, resumen de trabajos y recordatorio de mantenimiento preventivo, registrando cada envío en la tabla notificaciones. 

## **Firebase Cloud Messaging (FCM)** 

Firebase Cloud Messaging es el servicio de notificaciones push de Google que permite enviar alertas en tiempo real a dispositivos Android, iOS y navegadores web. En AC Track se utiliza para alertar al técnico sobre nuevas órdenes asignadas , cambios de prioridad y actualizaciones de inventario, complementando las notificaciones SMS de Twilio. 

## **Recharts / Chart.js** 

Recharts es una biblioteca de gráficas para React construida sobre D3.js que proporciona componentes declarativos para líneas, barras, tortas y radiales. AC Track utiliza Recharts en las aplicaciones web y de escritorio para los dashboards de KPIs alimentados por la tabla reportes_cache, y Chart.js como complemento ligero en la aplicación móvil. 

## **Electron** 

Electron es un framework de código abierto que permite desarrollar aplicaciones de escritorio multiplataforma (Windows, macOS, Linux) usando React. Empaqueta Chromium y Node.js en un ejecutable, permitiendo acceso a recursos del sistema. AC Track utiliza Electron para la aplicación de escritorio del administrador y supervisor. 

## **7. Modelo de Base de Datos** 

La base de datos de AC Track está implementada en PostgreSQL. 

|**Grupo funcional**|**Tablas**|
|---|---|
|**Autenticación /**<br>**Login**|roles, usuarios, oauth_cuentas, sesiones|
|**Entidades**<br>**principales**|clientes, tecnicos, equipos_ac|
|**Operaciones de**<br>**servicio**|categorias_servicio, ordenes_servicio, bitacora_estados|
|**Inventario**|categorias_inventario, inventario, movimientos_inventario|
|**Área comercial**|cotizaciones, cotizacion_detalle, pagos, rutas,<br>ruta_paradas|
|**Soporte operativo**|mantenimientos_preventivos, checklist_plantillas,<br>checklist_items_plantilla, checklist_ejecucion,<br>notificaciones, reportes_cache|



## **8. Diccionario de Datos** 

A continuación se describen los campos de las 23 tablas que conforman la base de datos de AC Track. 

## **Tabla: roles** 

|**Campo**|**Tipo**|**Nulo**|**PK/FK**|**Default**|**Descripción**|
|---|---|---|---|---|---|
|**id**|INT|NO|PK|autoincrement|Identificador único<br>del rol|
|**nombre**|VARCHAR(50)|NO|UNIQUE|-|Nombre del rol:<br>admin | supervisor<br>| tecnico | cliente|



## **Tabla: usuarios** 

|**Campo**|**Tipo**|**Nul**<br>**o**|**PK/FK**|**Default**|**Descripció**<br>**n**|
|---|---|---|---|---|---|
|**id**|INT|NO|PK|uuid_generate_v4(<br>)|Identificador<br>único del<br>usuario|
|**rol_id**|INT|NO|FK|-|Rol<br>asignado<br>(tabla roles)|
|**nombre**|VARCHAR(150<br>)|NO|-|-|Nombre<br>completo del<br>usuario|
|**email**|VARCHAR(255<br>)|NO|UNIQU<br>E|-|Correo<br>electrónico,<br>indexado|
|**password**|TEXT|SI|-|NULL|Hash bcrypt;<br>NULL si el<br>usuario usa<br>OAuth|
|**activo**|BOOLEAN|NO|-|TRUE|Indica si la<br>cuenta esta<br>habilitada|
|**created_a**<br>**t**|TIMESTAMP|NO|-|NOW()|Fecha y<br>hora de<br>creacion del|



registro 

## **Tabla: oauth_cuentas** 

|**Campo**|**Tipo**|**Nulo**|**PK/FK**|**Default**|**Descripción**|
|---|---|---|---|---|---|
|**id**|INT|NO|PK|autoincrement|Identificador<br>unico del<br>registro OAuth|
|**usuario_id**|INT|NO|FK|-|Usuario<br>propietario de<br>la cuenta<br>OAuth|
|**proveedor**|VARCHAR(30)|NO|-|-|Proveedor<br>OAuth: google |<br>facebook|
|**provider_uid**|TEXT|NO|UNIQUE|-|ID unico del<br>usuario en el<br>proveedor<br>externo|



## **Tabla: sesiones** 

|**Campo**|**Tipo**|**Nul**<br>**o**|**PK/FK**|**Default**|**Descripció**<br>**n**|
|---|---|---|---|---|---|
|**id**|INT|NO|PK|uuid_generate_v4(<br>)|Identificador<br>unico de la<br>sesion|
|**usuario_id**|INT|NO|FK|-|Usuario<br>propietario<br>de la sesion|
|**refresh_toke**<br>**n**|TEXT|NO|UNIQU<br>E|-|Token de<br>renovacion<br>JWT<br>almacenado<br>de forma<br>segura|
|**expira_en**|TIMESTAM<br>P|NO|-|-|Fecha y<br>hora de<br>expiracion<br>del refresh|



||||||token|
|---|---|---|---|---|---|
|**created_at**|TIMESTAM<br>P|NO|-|NOW()|Fecha de<br>apertura de<br>la sesion|



## **Tabla: clientes** 

|**Campo**|**Tipo**|**Nulo**|**PK/FK**|**Default**|**Descripción**|
|---|---|---|---|---|---|
|**id**|INT|NO|PK|uuid_generate_v4()|Identificador<br>unico del<br>cliente|
|**usuario_id**|INT|SI|FK|NULL|Cuenta de<br>usuario<br>asociada (si<br>tiene acceso<br>al portal)|
|**nombre**|VARCHAR(200)|NO|-|-|Nombre<br>completo o<br>razon social<br>del cliente|
|**email**|VARCHAR(255)|SI|-|NULL|Correo<br>electronico<br>de contacto|
|**telefono**|VARCHAR(20)|SI|-|NULL|Numero<br>telefonico<br>para SMS<br>via Twilio|
|**direccion**|VARCHAR(300)|SI|-|NULL|Direccion<br>fisica del<br>cliente|
|**activo**|BOOLEAN|NO|-|TRUE|Indica si el<br>cliente esta<br>activo en el<br>sistema|
|**created_at**|TIMESTAMP|NO|-|NOW()|Fecha de<br>registro del<br>cliente|



**Tabla: tecnicos** 

|**Campo**|**Tipo**|**Nul**<br>**o**|**PK/FK**|**Default**|**Descripción**|
|---|---|---|---|---|---|
|**id**|INT|NO|PK|uuid_generate_v4(<br>)|Identificador<br>unico del<br>tecnico|
|**usuario_id**|INT|NO|FK/U<br>Q|-|Referencia<br>al usuario<br>(relacion<br>1:1)|
|**especialida**<br>**d**|VARCHAR(100<br>)|SI|FK|NULL|Especialidad<br>tecnica<br>(split, VRF,<br>cassette,<br>etc.)|
|**disponible**|BOOLEAN|NO|-|TRUE|Indica si el<br>tecnico<br>acepta<br>nuevas<br>asignacione<br>s|
|**created_at**|TIMESTAMP|NO|-|NOW()|Fecha de<br>registro del<br>tecnico|



Especialidades 

|**Campo**|**Tipo**|**Nulo**|**PK/FK**|**Default**|**Descripción**|
|---|---|---|---|---|---|
|**id**|INT|NO|PK|uuid_generate_v4()|Identificador<br>unico del<br>tecnico|
|**nombre**|VARCHAR(100)|NO|FK/UQ||Especialidad<br>tecnica<br>(split, VRF,<br>cassette,<br>etc.)|



**Tabla: equipos_ac** 

|**Campo**|**Tipo**|**Nul**<br>**o**|**PK/F**<br>**K**|**Default**|**Descripción**|
|---|---|---|---|---|---|
|**id**|INT|NO|PK|uuid_generate_v4<br>()|Identificador<br>unico del<br>equipo|
|**cliente_id**|INT|NO|FK|-|Cliente<br>propietario<br>del equipo|
|**marca_id**|INT|NO|-FK|-|Marca del<br>equipo de<br>aire<br>acondicionad<br>o|
|**modelo**|VARCHAR(100<br>)|SI|-|NULL|Modelo del<br>equipo|
|**numero_seri**<br>**e**|VARCHAR(100<br>)|SI|-|NULL|Numero de<br>serie del<br>fabricante|
|**tipo**|VARCHAR(50)|SI|-|NULL|Tipo: split |<br>central |<br>cassette |<br>otros|
|**activo**|BOOLEAN|NO|-|TRUE|Indica si el<br>equipo esta<br>activo|
|**created_at**|TIMESTAMP|NO|-|NOW()|Fecha de<br>registro del<br>equipo|



## Tabla: Marcas 

|**Campo**|**Tipo**|**Nulo**|**PK/FK**|**Default**|**Descripción**|
|---|---|---|---|---|---|
|**id**|INT|NO|PK|uuid_generate_v4()|Identificador<br>unico del<br>tecnico|
|**nombre**|VARCHAR(100)|NO|FK/UQ||Especialidad<br>tecnica<br>(split, VRF,<br>cassette,|



etc.) 

## **Tabla: Marcas** 

|**Campo**|**Tipo**|**Nulo**|**PK/FK**|**Default**|**Descripción**|
|---|---|---|---|---|---|
|**id**|INT|NO|PK|autoincrement|Identificador unico<br>de la marca|
|**nombre**|VARCHAR(100)|NO|UNIQUE|-|Marca del equipo<br>de aire<br>acondicionado|



## Tabla: categorias_servcio 

|**Campo**|**Tipo**|**Nulo**|**PK/FK**|**Default**|**Descripción**|
|---|---|---|---|---|---|
|**id**|INT|NO|PK|autoincrement|Identificador unico<br>de la categoria|
|**nombre**|VARCHAR(100)|NO|UNIQUE|-|Nombre de la<br>categoria (ej,<br>instalacion<br>mantenimineto<br>preventivo)|



## **Tabla: ordenes_servicio** 

|**Campo**|**Tipo**|**Nul**<br>**o**|**PK/FK**|**Default**|**Descripción**|
|---|---|---|---|---|---|
|**id**|INT|NO|PK|uuid_generate_<br>v4()|Identificador<br>unico de la<br>orden de<br>servicio|
|**folio**|VARCHAR(<br>20)|NO|UNIQ<br>UE|-|Folio legible<br>generado (ej.<br>OS-2024-001)|
|**cliente_id**|INT|NO|FK|-|Cliente que<br>solicita el<br>servicio|



|**equipo_id**|INT|SI|FK|NULL|Equipo AC a<br>intervenir|
|---|---|---|---|---|---|
|**categoria_id**|INT|SI|FK|NULL|Tipo de servicio<br>(tabla<br>categorias_serv<br>icio)|
|**tecnico_asignad**<br>**o_id**|INT|SI|FK|NULL|Tecnico<br>responsable de<br>atender la<br>orden|
|**creado_por**|INT|SI|FK|NULL|Usuario que<br>registro la<br>orden en el<br>sistema|
|**prioridad**|VARCHAR(<br>20)|NO|-|normal|Nivel de<br>prioridad: baja |<br>normal | alta |<br>urgente|
|**estado**|VARCHAR(<br>30)|NO|-|pendiente|Estado:<br>pendiente |<br>programada |<br>en_proceso |<br>completada |<br>cancelada|
|**descripcion**|TEXT|SI|-|NULL|Descripcion de<br>la falla o<br>servicio<br>requerido|
|**fecha_programa**<br>**da**|TIMESTAM<br>P|SI|-|NULL|Fecha y hora<br>de la cita<br>agendada con<br>el cliente|
|**fecha_cierre**|TIMESTAM<br>P|SI|-|NULL|Fecha y hora<br>en que se cerro<br>la orden|
|**created_at**|TIMESTAM<br>P|NO|-|NOW()|Fecha de<br>creacion del<br>registro|



**Tabla: bitacora_estados** 

|**Campo**|**Tipo**|**Nulo**|**PK/FK**|**Default**|**Descripción**|
|---|---|---|---|---|---|
|**id**|INT|NO|PK|autoincrement|Identificador<br>unico del<br>evento de<br>cambio|
|**orden_id**|INT|NO|FK|-|Orden de<br>servicio que<br>cambio de<br>estado|
|**estado_anterior**|VARCHAR(30)|SI|-|NULL|Estado previo<br>al cambio<br>(NULL en la<br>creacion<br>inicial)|
|**estado_nuevo**|VARCHAR(30)|NO|-|-|Nuevo estado<br>asignado a la<br>orden|
|**usuario_id**|INT|SI|FK|NULL|Usuario que<br>realizo el<br>cambio de<br>estado|
|**created_at**|TIMESTAMP|NO|-|NOW()|Fecha y hora<br>en que ocurrio<br>el cambio|



**Tabla: categorias_inventario** 

|**Campo**|**Tipo**|**Nulo**|**PK/FK**|**Default**|**Descripción**|
|---|---|---|---|---|---|
|**id**|INT|NO|PK|autoincrement|Identificador unico<br>de la categoria|
|**nombre**|VARCHAR(100)|NO|UNIQUE|-|Nombre de la<br>categoria (ej.<br>Refrigerantes,<br>Filtros y mallas)|



## **Tabla: inventario** 

|**Campo**|**Tipo**|**Nul**<br>**o**|**PK/FK**|**Default**|**Descripción**|
|---|---|---|---|---|---|
|**id**|INT|NO|PK|uuid_generate_<br>v4()|Identificador unico<br>del articulo|
|**categoria_id**|INT|SI|FK|NULL|Categoria del<br>articulo (tabla<br>categorias_invent<br>ario)|
|**codigo**|VARCHAR(6<br>0)|NO|UNIQU<br>E|-|Codigo interno<br>unico del articulo|
|**nombre**|VARCHAR(2<br>00)|NO|-|-|Nombre<br>descriptivo del<br>articulo|
|**unidad_med**<br>**ida**|VARCHAR(3<br>0)|NO|-|pza|Unidad: pza | kg |<br>lt | m|
|**stock_actual**|NUMERIC(1<br>2,3)|NO|-|0|Cantidad actual<br>disponible en<br>almacen|
|**stock_mini**<br>**mo**|NUMERIC(1<br>2,3)|NO|-|0|Nivel minimo para<br>disparar alerta de<br>reabastecimiento|
|**precio_vent**<br>**a**|NUMERIC(1<br>2,2)|SI|-|NULL|Precio de venta al<br>cliente en MXN|
|**activo**|BOOLEAN|NO|-|TRUE|Indica si el<br>articulo esta<br>disponible para<br>uso|
|**created_at**|TIMESTAMP|NO|-|NOW()|Fecha de alta del<br>articulo en el<br>sistema|



## **Tabla: movimientos_inventario** 

|**Campo**|**Tipo**|**Nulo**|**PK/FK**|**Default**|**Descripción**|
|---|---|---|---|---|---|
|**id**|INT|NO|PK|autoincrement|Identificador<br>unico del<br>movimiento|



|**inventario_id**|INT|NO|FK|-|Articulo de<br>inventario<br>afectado por el<br>movimiento|
|---|---|---|---|---|---|
|**orden_id**|INT|SI|FK|NULL|Orden de<br>servicio que<br>origino el<br>movimiento (si<br>aplica)|
|**usuario_id**|INT|SI|FK|NULL|Usuario que<br>registro el<br>movimiento|
|**tipo**|VARCHAR(20)|NO|-|-|Tipo de<br>movimiento:<br>entrada | salida<br>| ajuste|
|**cantidad**|NUMERIC(12,3)|NO|-|-|Cantidad<br>afectada (el tipo<br>define si es<br>entrada o<br>salida)|
|**created_at**|TIMESTAMP|NO|-|NOW()|Fecha y hora<br>del movimiento|



**Tabla: cotizaciones** 

|**Campo**|**Tipo**|**Nul**<br>**o**|**PK/FK**|**Default**|**Descripción**|
|---|---|---|---|---|---|
|**id**|INT|NO|PK|uuid_generate_v4(<br>)|Identificador<br>unico de la<br>cotizacion|
|**folio**|VARCHAR(20)|NO|UNIQU<br>E|-|Folio legible<br>de la<br>cotizacion (ej.<br>COT-2024-<br>001)|
|**orden_id**|INT|SI|FK|NULL|Orden de<br>servicio<br>asociada a la<br>cotizacion|



|**cliente_id**|INT|NO|FK|-|Cliente<br>destinatario<br>de la<br>cotizacion|
|---|---|---|---|---|---|
|**tecnico_i**<br>**d**|INT|SI|FK|NULL|Tecnico que<br>elaboro la<br>cotizacion|
|**estado**|VARCHAR(20)|NO|-|borrador|Estado:<br>borrador |<br>enviada |<br>aprobada |<br>rechazada|
|**total**|NUMERIC(14,2<br>)|NO|-|0|Monto total de<br>la cotizacion<br>en MXN|
|**notas**|TEXT|SI|-|NULL|Observacione<br>s o<br>condiciones<br>adicionales|
|**created_a**<br>**t**|TIMESTAMP|NO|-|NOW()|Fecha de<br>creacion de la<br>cotizacion|



## **Tabla: cotizacion_detalle** 

|**Campo**|**Tipo**|**Nul**<br>**o**|**PK/F**<br>**K**|**Default**|**Descripción**|
|---|---|---|---|---|---|
|**id**|INT|NO|PK|autoincremen<br>t|Identificador<br>unico del<br>renglon|
|**cotizacion_id**|INT|NO|FK|-|Cotizacion a<br>la que<br>pertenece el<br>renglon|
|**inventario_id**|INT|SI|FK|NULL|Articulo de<br>inventario<br>(NULL si es<br>mano de obra)|
|**descripcion**|VARCHAR(300)|NO|-|-|Descripcion<br>del concepto|



||||||cotizado|
|---|---|---|---|---|---|
|**cantidad**|NUMERIC(12,3<br>)|NO|-|-|Cantidad del<br>concepto|
|**precio_unitari**<br>**o**|NUMERIC(12,2<br>)|NO|-|-|Precio unitario<br>en MXN|
|**subtotal**|NUMERIC(14,2<br>)|NO|-|-|Subtotal<br>calculado:<br>cantidad x<br>precio_unitari<br>o|
|**es_mano_obra**|BOOLEAN|NO|-|FALSE|TRUE si el<br>renglon es<br>mano de obra;<br>FALSE si es<br>material|



## **Tabla: pagos** 

|**Campo**|**Tipo**|**Nul**<br>**o**|**PK/F**<br>**K**|**Default**|**Descripción**|
|---|---|---|---|---|---|
|**id**|INT|NO|PK|uuid_generate_v4<br>()|Identificador<br>unico del<br>pago|
|**orden_id**|INT|NO|FK|-|Orden de<br>servicio a la<br>que<br>corresponde<br>el pago|
|**cliente_id**|INT|NO|FK|-|Cliente que<br>realiza el<br>pago|
|**cotizacion_i**<br>**d**|INT|SI|FK|NULL|Cotizacion<br>aprobada que<br>origino el<br>pago|
|**metodo**|VARCHAR(30)|NO|-|efectivo|Metodo de<br>pago: efectivo<br>| transferencia<br>| tarjeta | otro|



|**monto**||NUMERIC(14,<br>2)|NUMERIC(14,<br>2)|NO|NO|-|-|Monto total<br>del pago en<br>MXN|
|---|---|---|---|---|---|---|---|---|
|**estado**||VARCHAR(20)||NO||-|pendiente|Estado:<br>pendiente |<br>pagado |<br>cancelado|
|**notas**||TEXT||SI||-|NULL|Observacione<br>s adicionales<br>del pago|
|**created_at**||TIMESTAMP||NO||-|NOW()|Fecha de<br>registro del<br>pago|
|**Tabla: rutas**||||||||**Descripción**<br>Identificador<br>unico de la<br>ruta<br>Tecnico al<br>que<br>pertenece la<br>ruta del dia<br>Fecha de la<br>ruta (una<br>por tecnico<br>por dia)<br>Estado:<br>planificada |<br>en_curso |<br>completada |<br>cancelada<br>Fecha de<br>creacion del<br>registro|
|**Campo**||**Tipo**|**Nulo**||**PK/FK**||**Default**|**Descripción**|
|**id**|INT||NO||PK||uuid_generate_v4()|Identificador<br>unico de la<br>ruta|
|**tecnico_id**|INT||NO||FK||-|Tecnico al<br>que<br>pertenece la<br>ruta del dia|
|**fecha_ruta**|DATE||NO||UNIQUE||-|Fecha de la<br>ruta (una<br>por tecnico<br>por dia)|
|**estado**|VARCHAR(20)||NO||-||planificada|Estado:<br>planificada |<br>en_curso |<br>completada |<br>cancelada|
|**created_at**|TIMESTAMP||NO||-||NOW()|Fecha de<br>creacion del<br>registro|



## **Tabla: ruta_paradas** 

**Campo Tipo Nulo PK/FK Default Descripción** 

|**id**|INT|NO|PK|autoincrement|Identificador<br>unico de la<br>parada|
|---|---|---|---|---|---|
|**ruta_id**|INT|NO|FK|-|Ruta a la que<br>pertenece la<br>parada|
|**orden_id**|INT|NO|FK|-|Orden de<br>servicio a<br>visitar en<br>esta parada|
|**posicion**|INT|NO|UNIQUE|-|Numero de<br>orden de<br>visita dentro<br>de la ruta (1,<br>2, 3...)|
|**hora_estimada**|TIME|SI|-|NULL|Hora<br>estimada de<br>llegada<br>calculada por<br>Google Maps|
|**estado**|VARCHAR(20)|NO|-|pendiente|Estado de la<br>parada:<br>pendiente |<br>completada |<br>omitida|



## **Tabla: notificaciones** 

|**Campo**|**Tipo**|**Nul**<br>**o**|**PK/F**<br>**K**|**Default**|**Descripción**|
|---|---|---|---|---|---|
|**id**|INT|NO|PK|uuid_generate_v4(<br>)|Identificador<br>unico de la<br>notificacion|
|**usuario_i**<br>**d**|INT|NO|FK|-|Usuario<br>destinatario de<br>la notificacion|
|**tipo**|VARCHAR(50)|NO|-|-|Tipo de<br>evento:<br>nueva_orden |<br>tecnico_camin<br>o||



||||||sms_enviado |<br>etc.|
|---|---|---|---|---|---|
|**titulo**|VARCHAR(200<br>)|NO|-|-|Titulo o asunto<br>de la<br>notificacion|
|**leida**|BOOLEAN|NO|-|FALSE|Indica si el<br>usuario ya leyo<br>la notificacion|
|**created_a**<br>**t**|TIMESTAMP|NO|-|NOW()|Fecha y hora<br>en que se<br>genero la<br>notificacion|



**Tabla: mantenimientos_preventivos** 

|**Campo**|**Tipo**|**Nul**<br>**o**|**PK/F**<br>**K**|**Default**|**Descripción**|
|---|---|---|---|---|---|
|**id**|INT|NO|PK|uuid_generate_v4<br>()|Identificador<br>unico del plan<br>de<br>mantenimiento|
|**cliente_id**|INT|NO|FK|-|Cliente titular<br>del plan de<br>mantenimiento|
|**equipo_id**|INT|SI|FK|NULL|Equipo AC al<br>que aplica el<br>plan (NULL =<br>todos los del<br>cliente)|
|**frecuencia_dia**<br>**s**|INT|NO|-|-|Frecuencia en<br>dias entre<br>mantenimiento<br>s (ej. 90, 180,<br>365)|
|**proxima_fecha**|DATE|NO|-|-|Fecha<br>calculada del<br>proximo<br>mantenimiento<br>a programar|



|**activo**|BOOLEAN|NO|-|TRUE|Indica si el<br>plan de<br>mantenimiento<br>esta vigente|
|---|---|---|---|---|---|
|**created_at**|TIMESTAM<br>P|NO|-|NOW()|Fecha de<br>creacion del<br>plan|



## **Tabla: checklist_plantillas** 

|**Campo**|**Tipo**|**Nul**<br>**o**|**PK/F**<br>**K**|**Default**|**Descripción**|
|---|---|---|---|---|---|
|**id**|INT|NO|PK|autoincremen<br>t|Identificador unico<br>de la plantilla|
|**nombre**|VARCHAR(150<br>)|NO|-|-|Nombre descriptivo<br>de la plantilla de<br>checklist|
|**categoria_i**<br>**d**|INT|SI|FK|NULL|Categoria de<br>servicio asociada<br>(tabla<br>categorias_servicio<br>)|
|**activo**|BOOLEAN|NO|-|TRUE|Indica si la plantilla<br>esta disponible<br>para usar|



## **Tabla: checklist_items_plantilla** 

|**Campo**|**Tipo**|**Nulo**|**PK/FK**|**Default**|**Descripción**|
|---|---|---|---|---|---|
|**id**|INT|NO|PK|autoincrement|Identificador<br>unico del item de<br>plantilla|
|**plantilla_id**|INT|NO|FK|-|Plantilla a la que<br>pertenece el item|
|**descripcion**|VARCHAR(300)|NO|-|-|Descripcion de la<br>tarea o<br>verificacion a<br>realizar|
|**orden**|SMALLINT|NO|-|0|Posicion del item<br>dentro de la|



plantilla (ascendente) 

## **Tabla: checklist_ejecucion** 

|**Campo**|**Tipo**|**Nulo**|**PK/FK**|**Default**|**Descripción**|
|---|---|---|---|---|---|
|**id**|INT|NO|PK|autoincrement|Identificador<br>unico del item<br>ejecutado|
|**orden_id**|INT|NO|FK|-|Orden de<br>servicio en la que<br>se ejecuto el<br>checklist|
|**plantilla_id**|INT|SI|FK|NULL|Plantilla de<br>origen del item<br>(referencia)|
|**item_desc**|VARCHAR(300)|NO|-|-|Descripcion del<br>item al momento<br>de ejecutarse|
|**completado**|BOOLEAN|NO|-|FALSE|Indica si el<br>tecnico marco el<br>item como<br>completado|
|**created_at**|TIMESTAMP|NO|-|NOW()|Fecha y hora en<br>que se registro la<br>ejecucion del<br>item|



## **9.Diseño provisional de pantallas Escritorio** 

## **1.Login** 

## **Dashboard** 

**==> picture [166 x 10] intentionally omitted <==**

**----- Start of picture text -----**<br>
-Listado Ordenes de Servicio<br>**----- End of picture text -----**<br>


## **Web** 

## **-Ordenes** 

## **-Mis equipos/cotizaciones** 

**==> picture [31 x 10] intentionally omitted <==**

**----- Start of picture text -----**<br>
Movil<br>**----- End of picture text -----**<br>


**==> picture [90 x 6] intentionally omitted <==**

**----- Start of picture text -----**<br>
DETALLE DE ORDEN<br>**----- End of picture text -----**<br>


**==> picture [182 x 135] intentionally omitted <==**

**----- Start of picture text -----**<br>
| INFO| CHECKLIST | INV, | CIERRE H<br>Informacion del Cliente<br>Nombre: Corporativo Nexus<br>; Contacto: Ing. Ramos<br>| Telf: 555-0102<br>Datos del Equipo<br>Equipo: Aire Central 5TR<br>;' Marca:Ubicacion: CarrierAzotea/ ModelPis o :12XJ-200 '<br>**----- End of picture text -----**<br>


**==> picture [106 x 7] intentionally omitted <==**

**----- Start of picture text -----**<br>
Consultande tablas clientes y equipos_ac<br>**----- End of picture text -----**<br>


## INVENTARIO DE CAMPO 

Stock en Vehiculo: 

**==> picture [185 x 49] intentionally omitted <==**

**----- Start of picture text -----**<br>
item Stock Usar<br>| Gas R-410a | 5.0 kg<br>; Filtra 20x20 : 10 ud<br>**----- End of picture text -----**<br>


**==> picture [142 x 9] intentionally omitted <==**

**----- Start of picture text -----**<br>
REGISTRAR MATERIALES<br>**----- End of picture text -----**<br>


Afecta tabla movimientos_inventania 

## **10.Servicios Externos** 

|**Servicio**|**Proveedor / API**|**Uso dentro de AC Track**|
|---|---|---|
|**Geolocalización**<br>**y Ruteo**|Google Maps<br>Platform<br>(Directions API +<br>Maps JS API +<br>Geocoding API)|Calcula la ruta óptima diaria del técnico,<br>geocodifica direcciones de clientes y<br>muestra en mapa la posición en tiempo<br>real de los técnicos. Los resultados se<br>almacenan en las tablas rutas y<br>ruta_paradas. Se consume desde la app<br>de escritorio y la app móvil.|
|**Notificaciones**<br>**SMS**|Twilio SMS API<br>(REST API +<br>Node.js SDK)|Envía mensajes de texto automáticos al<br>cliente registrado en la tabla clientes en<br>los eventos clave: confirmación de cita,<br>técnico en camino, servicio completado y<br>recordatorio de mantenimiento preventivo.<br>Cada envío queda registrado en la tabla<br>notificaciones.|
|**Notificaciones**<br>**Push**|Firebase Cloud<br>Messaging (FCM<br>REST API v1)|Envía notificaciones push al técnico<br>(nueva OS asignada, cambio de prioridad,<br>alerta de stock mínimo en inventario) y al<br>cliente (técnico en camino, cotización<br>lista). Complementa los SMS de Twilio<br>para usuarios con la app instalada.|



## **11. Módulos por Aplicación y Servicios Utilizados** 

## **Aplicación de Escritorio – Panel Administrativo (Electron + React)** 

Usuarios objetivo: administrador y supervisor. 

|**Módulo**|**Descripción y servicios usados**|
|---|---|
|**Dashboard / KPIs**|Gráficas de órdenes por estado, técnico más<br>productivo, ingresos del mes y stock crítico. Datos<br>obtenidos de la tabla reportes_cache. Usa Recharts.|
|**Gestión de Órdenes**|CRUD completo de ordenes_servicio. Cambio de<br>estado con registro automático en bitacora_estados.<br>Asignación de técnico disponible.|
|**Gestión de Técnicos**|Alta, baja y edición de registros en tecnicos y usuarios.<br>Mapa con posición en tiempo real usando Google<br>Maps JS API.|



|**Gestión de Clientes y**<br>**Equipos**|Catálogo de clientes (tabla clientes) con historial de<br>equipos (equipos_ac) y órdenes de servicio asociadas.|
|---|---|
|**Inventario y Almacén**|Control de stock en inventario. Registro de<br>movimientos (entradas/salidas/ajustes) en<br>movimientos_inventario. Alertas de stock_minimo.|
|**Cotizaciones**|Creación y seguimiento de cotizaciones y<br>cotizacion_detalle. Al aprobar, dispara SMS de<br>confirmación via Twilio y actualiza estado de la OS.|
|**Pagos**|Registro de pagos vinculados a orden y cotización<br>aprobada. Estados: pendiente / pagado / cancelado.<br>Métodos: efectivo, transferencia, tarjeta.|
|**Planificación de Rutas**|Vista semanal de rutas por técnico. Optimización de<br>paradas usando Google Maps Directions API. Datos<br>persistidos en rutas y ruta_paradas.|
|**Mantenimientos**<br>**Preventivos**|Listado de equipos con próxima fecha de<br>mantenimiento. Generación automática de nueva OS y<br>envío de SMS de recordatorio via Twilio.|
|**Reportes**|Exportación de reportes de productividad, cobros,<br>inventario y satisfacción. Gráficas con Recharts.<br>Resultados precalculados en reportes_cache.|
|**Configuración**|Administración de roles, usuarios, categorias_servicio,<br>categorias_inventario y checklist_plantillas.|



## **Aplicación Web – Portal del Cliente (React PWA)** 

Usuarios objetivo: clientes finales (personas y empresas). 

|**Módulo**|**Descripción y servicios usados**|
|---|---|
|**Login / Registro**|Acceso con email/contraseña o OAuth 2.0 con Google<br>o Facebook. Sesión gestionada con JWT almacenado<br>en la tabla sesiones.|
|**Solicitud de Servicio**|Formulario para crear una nueva entrada en<br>ordenes_servicio: selección de equipo, descripción de<br>falla y fecha preferida.|
|**Seguimiento de**<br>**Órdenes**|Línea de tiempo del estado actual de la OS.<br>Notificaciones push via FCM cuando el técnico está en<br>camino o finaliza el servicio.|



Listado de registros en equipos_ac con historial de **Mis Equipos** órdenes y próxima fecha de mantenimiento_preventivo. Visualización y aceptación o rechazo de cotizaciones. **Cotizaciones** Al aceptar, llega SMS de confirmación via Twilio. Consulta del estado de pago de cada orden. Detalle de **Pagos** monto, método y fecha registrados en la tabla pagos. Gráficas de servicios por mes, gasto acumulado y tipos **Dashboard Cliente** de servicio más frecuentes. Usa Recharts. 

## **Aplicación Móvil – App del Técnico (React Native)** 

Usuarios objetivo: técnicos de campo. 

|**Módulo**|**Descripción y servicios usados**|
|---|---|
|**Login**|Acceso con credenciales propias u OAuth 2.0 (Google).<br>Sesión persistida con JWT y refresh token en tabla<br>sesiones.|
|**Mi Agenda del Día**|Lista de ordenes_servicio asignadas para hoy con<br>dirección, prioridad y hora estimada de la tabla<br>ruta_paradas.|
|**Ruta Optimizada**|Mapa con Google Maps SDK mostrando el orden<br>óptimo de visitas y ETA por parada. Botón de<br>navegación nativa.|
|**Detalle de Orden**|Vista completa de la OS: datos del cliente (clientes),<br>historial del equipo (equipos_ac), diagnóstico y<br>observaciones.|
|**Checklist de Trabajo**|Formulario interactivo basado en checklist_plantillas.<br>Marca ítems en checklist_ejecucion con notas por cada<br>uno.|
|**Inventario de Campo**|Consulta del stock en inventario. Registro de<br>refacciones y refrigerantes usados en|



||movimientos_inventario vinculado a la OS.|
|---|---|
|**Cierre de Servicio**|Registra fecha_cierre en la OS y cambia estado a<br>'completada'. Dispara SMS de resumen al cliente via<br>Twilio y push via FCM.|
|**Mis Estadísticas**|Gráficas personales: órdenes completadas por semana<br>y calificación promedio. Usa Chart.js.|
|**Notificaciones Push**|Recepción de alertas via FCM: nueva OS asignada,<br>cambio de prioridad, mensaje del supervisor. Log en<br>tabla notificaciones.|
|**Perfil y Disponibilidad**|Actualización del campo disponible en tabla tecnicos.<br>Edición de datos personales en usuarios.|



