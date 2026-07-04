/*==============================================================*/
/* DBMS name:      PostgreSQL 8                                 */
/* Created on:     08/06/2026 15:41:49                          */
/*==============================================================*/


drop table BITACORA_ESTADOS;

drop table CATEGORIA_INVENTARIO;

drop table CATEGORIA_SERVICIO;

drop table CHECKLIST_EJECUCION;

drop table CHECKLIST_ITEMS_PLANTILLA;

drop table CHECKLIST_PLANTILLAS;

drop table CLIENTES;

drop table COTIZACIONES;

drop table COTIZACION_DETALLE;

drop table EQUIPOS_AC;

drop table ESPECIALIDAD;

drop table INVENTARIO;

drop table MANTENIMIENTO_PREVENTIVO;

drop table MARCA;

drop table MOVIMIENTOS_INVENTARIO;

drop table NOTIFICACIONES;

drop table OAUTH_CUENTAS;

drop table ORDENES_SERVICIO;

drop table PAGOS;

drop table PRIORIDAD;

drop table ROLES;

drop table RUTAS;

drop table RUTA_PARADAS;

drop table SESIONES;

drop table TECNICOS;

drop table TIPOS_MOVIMIENTO_INVENTARIO;

drop table USUARIOS;

/*==============================================================*/
/* Table: BITACORA_ESTADOS                                      */
/*==============================================================*/
create table BITACORA_ESTADOS (
   ID                   INT2                 not null,
   ORD_ID               INT2                 null,
   USU_ID               INT2                 null,
   ESTADO_ANTERIOR      VARCHAR(50)          null,
   ESTADO_NUEVO         VARCHAR(50)          null,
   constraint PK_BITACORA_ESTADOS primary key (ID)
);

/*==============================================================*/
/* Table: CATEGORIA_INVENTARIO                                  */
/*==============================================================*/
create table CATEGORIA_INVENTARIO (
   ID                   INT2                 not null,
   NOMBRE               VARCHAR(50)          null,
   constraint PK_CATEGORIA_INVENTARIO primary key (ID)
);

/*==============================================================*/
/* Table: CATEGORIA_SERVICIO                                    */
/*==============================================================*/
create table CATEGORIA_SERVICIO (
   ID                   INT2                 not null,
   NOMBRE               VARCHAR(80)          null,
   constraint PK_CATEGORIA_SERVICIO primary key (ID)
);

/*==============================================================*/
/* Table: CHECKLIST_EJECUCION                                   */
/*==============================================================*/
create table CHECKLIST_EJECUCION (
   ID                   INT2                 not null,
   CHE_ID               INT2                 null,
   ORD_ID               INT2                 null,
   COMPLETADO           bool                 null,
   ITEM_DESC            VARCHAR(50)          null,
   TOTAL                NUMERIC              null,
   NOTAS                TEXT                 null,
   constraint PK_CHECKLIST_EJECUCION primary key (ID)
);

/*==============================================================*/
/* Table: CHECKLIST_ITEMS_PLANTILLA                             */
/*==============================================================*/
create table CHECKLIST_ITEMS_PLANTILLA (
   ID                   INT2                 not null,
   CHE_ID               INT2                 null,
   DESCRIPCION          VARCHAR(50)          null,
   ORDEN                INT2                 null,
   constraint PK_CHECKLIST_ITEMS_PLANTILLA primary key (ID)
);

/*==============================================================*/
/* Table: CHECKLIST_PLANTILLAS                                  */
/*==============================================================*/
create table CHECKLIST_PLANTILLAS (
   ID                   INT2                 not null,
   CAT_ID               INT2                 null,
   NOMBRE               VARCHAR(50)          null,
   ACTIVO               BOOL                 null,
   constraint PK_CHECKLIST_PLANTILLAS primary key (ID)
);

/*==============================================================*/
/* Table: CLIENTES                                              */
/*==============================================================*/
create table CLIENTES (
   ID                   INT2                 not null,
   USU_ID               INT2                 null,
   NOMBRE               VARCHAR(50)          null,
   EMAIL                VARCHAR(80)          null,
   TELEFONO             VARCHAR(10)          null,
   DIRECCION            VARCHAR(100)         null,
   ACTIVO               BOOL                 null,
   constraint PK_CLIENTES primary key (ID)
);

/*==============================================================*/
/* Table: COTIZACIONES                                          */
/*==============================================================*/
create table COTIZACIONES (
   ID                   INT2                 not null,
   ORD_ID               INT2                 null,
   TEC_ID               INT2                 null,
   CLI_ID               INT2                 null,
   FOLIO                VARCHAR(50)          null,
   ESTADO               VARCHAR(50)          null,
   TOTAL                NUMERIC              null,
   NOTAS                TEXT                 null,
   constraint PK_COTIZACIONES primary key (ID)
);

/*==============================================================*/
/* Table: COTIZACION_DETALLE                                    */
/*==============================================================*/
create table COTIZACION_DETALLE (
   ID                   INT2                 not null,
   INV_ID               INT2                 null,
   COT_ID               INT2                 null,
   CANTIDAD             INT2                 null,
   PRECIO_UNITARIO      NUMERIC              null,
   SUBTOTAL             NUMERIC              null,
   ES_MANO_OBRA         BOOL                 null,
   constraint PK_COTIZACION_DETALLE primary key (ID)
);

/*==============================================================*/
/* Table: EQUIPOS_AC                                            */
/*==============================================================*/
create table EQUIPOS_AC (
   ID                   INT2                 not null,
   CLI_ID               INT2                 null,
   MAR_ID               INT2                 null,
   MODELO               VARCHAR(50)          null,
   NUMERO_SERIE         VARCHAR(50)          null,
   TIPO                 VARCHAR(50)          null,
   ACTIVO               BOOL                 null,
   constraint PK_EQUIPOS_AC primary key (ID)
);

/*==============================================================*/
/* Table: ESPECIALIDAD                                          */
/*==============================================================*/
create table ESPECIALIDAD (
   ID                   INT2                 not null,
   NOMBRE               VARCHAR(50)          null,
   constraint PK_ESPECIALIDAD primary key (ID)
);

/*==============================================================*/
/* Table: INVENTARIO                                            */
/*==============================================================*/
create table INVENTARIO (
   ID                   INT2                 not null,
   CAT_ID               INT2                 null,
   CODIGO               VARCHAR(50)          null,
   NOMBRE               VARCHAR(50)          null,
   UNIDAD_MEDIDA        VARCHAR(50)          null,
   STOCK_ACTUAL         NUMERIC              null,
   PRECIO_VENTA         NUMERIC              null,
   ACTIVO               BOOL                 null,
   constraint PK_INVENTARIO primary key (ID)
);

/*==============================================================*/
/* Table: MANTENIMIENTO_PREVENTIVO                              */
/*==============================================================*/
create table MANTENIMIENTO_PREVENTIVO (
   ID                   INT2                 not null,
   CLI_ID               INT2                 null,
   EQU_ID               INT2                 null,
   FRECUENCIA_DIAS      INT2                 null,
   PROXIMA_FECHA        DATE                 null,
   ACTIVO               BOOL                 null,
   constraint PK_MANTENIMIENTO_PREVENTIVO primary key (ID)
);

/*==============================================================*/
/* Table: MARCA                                                 */
/*==============================================================*/
create table MARCA (
   ID                   INT2                 not null,
   NOMBRE               VARCHAR(50)          null,
   constraint PK_MARCA primary key (ID)
);

/*==============================================================*/
/* Table: MOVIMIENTOS_INVENTARIO                                */
/*==============================================================*/
create table MOVIMIENTOS_INVENTARIO (
   ID                   INT2                 not null,
   INV_ID               INT2                 null,
   ORD_ID               INT2                 null,
   USU_ID               INT2                 null,
   TIP_ID               INT2                 null,
   CANTIDAD             NUMERIC              null,
   constraint PK_MOVIMIENTOS_INVENTARIO primary key (ID)
);

/*==============================================================*/
/* Table: NOTIFICACIONES                                        */
/*==============================================================*/
create table NOTIFICACIONES (
   ID                   INT2                 not null,
   USU_ID               INT2                 null,
   TIPO                 VARCHAR(50)          null,
   TITULO               VARCHAR(50)          null,
   LEIDO                BOOL                 null,
    constraint PK_NOTIFICACIONES primary key (ID)
);

/*==============================================================*/
/* Table: OAUTH_CUENTAS                                         */
/*==============================================================*/
create table OAUTH_CUENTAS (
   ID                   INT2                 not null,
   USU_ID               INT2                 null,
   PROVEEDOR            VARCHAR(90)          null,
   PROVIDER_UID         TEXT                 null,
   constraint PK_OAUTH_CUENTAS primary key (ID)
);

/*==============================================================*/
/* Table: ORDENES_SERVICIO                                      */
/*==============================================================*/
create table ORDENES_SERVICIO (
   ID                   INT2                 not null,
   CLI_ID               INT2                 null,
   EQU_ID               INT2                 null,
   CAT_ID               INT2                 null,
   PRI_ID               INT2                 null,
   FOLIO                VARCHAR(50)          null,
   PRIORIDAD            VARCHAR(50)          null,
   ESTATUS              VARCHAR(50)          null,
   DESCRIPCION          TEXT                 null,
   FECHA_PROGRAMADA     TIMESTAMP            null,
   FECHA_CIERRE         TIMESTAMP            null,
   TEC_ID               INT2                 null,
    constraint PK_ORDENES_SERVICIO primary key (ID)
);

/*==============================================================*/
/* Table: PAGOS                                                 */
/*==============================================================*/
create table PAGOS (
   ID                   INT2                 not null,
   COT_ID               INT2                 null,
   ORD_ID               INT2                 null,
   CLI_ID               INT2                 null,
   METODO               VARCHAR(50)          null,
   MONTO                NUMERIC              null,
   ESTADO               VARCHAR(50)          null,
   constraint PK_PAGOS primary key (ID)
);

/*==============================================================*/
/* Table: PRIORIDAD                                             */
/*==============================================================*/
create table PRIORIDAD (
   ID                   INT2                 not null,
   NUM_PRIORIDAD        INT2                 null,
   constraint PK_PRIORIDAD primary key (ID)
);

/*==============================================================*/
/* Table: ROLES                                                 */
/*==============================================================*/
create table ROLES (
   ID                   INT2                 not null,
   NOMBRE               VARCHAR(80)          null,
   constraint PK_ROLES primary key (ID)
);

/*==============================================================*/
/* Table: RUTAS                                                 */
/*==============================================================*/
create table RUTAS (
   ID                   INT2                 not null,
   TECNICO_ID           INT2                 null,
   FECHA_RUTA           DATE                 null,
   ESTADO               VARCHAR(50)          null,
    constraint PK_RUTAS primary key (ID)
);

/*==============================================================*/
/* Table: RUTA_PARADAS                                          */
/*==============================================================*/
create table RUTA_PARADAS (
   ID                   INT2                 not null,
   RUT_ID               INT2                 null,
   ORD_ID               INT2                 null,
   POSICION             INT2                 null,
   HORA_ESTIMADA        TIME                 null,
   ESTADO               VARCHAR(80)          null,
   constraint PK_RUTA_PARADAS primary key (ID)
);

/*==============================================================*/
/* Table: SESIONES                                              */
/*==============================================================*/
create table SESIONES (
   ID                   INT2                 not null,
   USU_ID               INT2                 null,
   REFRESH_TOKEN        TEXT                 null,
   EXPIRA               TIMESTAMP            null,
   constraint PK_SESIONES primary key (ID)
);

/*==============================================================*/
/* Table: TECNICOS                                              */
/*==============================================================*/
create table TECNICOS (
   ID                   INT2                 not null,
   USU_ID               INT2                 null,
   ESP_ID               INT2                 null,
   DISPONIBLE           BOOL                 null,
   constraint PK_TECNICOS primary key (ID)
);

/*==============================================================*/
/* Table: TIPOS_MOVIMIENTO_INVENTARIO                           */
/*==============================================================*/
create table TIPOS_MOVIMIENTO_INVENTARIO (
   ID                   INT2                 not null,
   NOMBRE               VARCHAR(50)          null,
   constraint PK_TIPOS_MOVIMIENTO_INVENTARIO primary key (ID)
);

/*==============================================================*/
/* Table: USUARIOS                                              */
/*==============================================================*/
create table USUARIOS (
   ID                   INT2                 not null,
   ROL_ID               INT2                 null,
   NOMBRE               VARCHAR(60)          null,
   PATERNO              VARCHAR(50)          null,
   MATERNO              VARCHAR(50)          null,
   EMAIL                VARCHAR(70)          null,
   PASSWORD             VARCHAR(50)          null,
   ACTIVO               BOOL                 null,
   constraint PK_USUARIOS primary key (ID)
);

alter table BITACORA_ESTADOS
   add constraint FK_BITACORA_REFERENCE_ORDENES_ foreign key (ORD_ID)
      references ORDENES_SERVICIO (ID)
      on delete restrict on update restrict;

alter table BITACORA_ESTADOS
   add constraint FK_BITACORA_REFERENCE_USUARIOS foreign key (USU_ID)
      references USUARIOS (ID)
      on delete restrict on update restrict;

alter table CHECKLIST_EJECUCION
   add constraint FK_CHECKLIS_REFERENCE_CHECKLIS foreign key (CHE_ID)
      references CHECKLIST_PLANTILLAS (ID)
      on delete restrict on update restrict;

alter table CHECKLIST_EJECUCION
   add constraint FK_CHECKLIS_REFERENCE_ORDENES_ foreign key (ORD_ID)
      references ORDENES_SERVICIO (ID)
      on delete restrict on update restrict;

alter table CHECKLIST_ITEMS_PLANTILLA
   add constraint FK_CHECKLIS_REFERENCE_CHECKLIS foreign key (CHE_ID)
      references CHECKLIST_PLANTILLAS (ID)
      on delete restrict on update restrict;

alter table CHECKLIST_PLANTILLAS
   add constraint FK_CHECKLIS_REFERENCE_CATEGORI foreign key (CAT_ID)
      references CATEGORIA_SERVICIO (ID)
      on delete restrict on update restrict;

alter table CLIENTES
   add constraint FK_CLIENTES_REFERENCE_USUARIOS foreign key (USU_ID)
      references USUARIOS (ID)
      on delete restrict on update restrict;

alter table COTIZACIONES
   add constraint FK_COTIZACI_REFERENCE_ORDENES_ foreign key (ORD_ID)
      references ORDENES_SERVICIO (ID)
      on delete restrict on update restrict;

alter table COTIZACIONES
   add constraint FK_COTIZACI_REFERENCE_CLIENTES foreign key (CLI_ID)
      references CLIENTES (ID)
      on delete restrict on update restrict;

alter table COTIZACIONES
   add constraint FK_COTIZACI_REFERENCE_TECNICOS foreign key (TEC_ID)
      references TECNICOS (ID)
      on delete restrict on update restrict;

alter table COTIZACION_DETALLE
   add constraint FK_COTIZACI_REFERENCE_INVENTAR foreign key (INV_ID)
      references INVENTARIO (ID)
      on delete restrict on update restrict;

alter table COTIZACION_DETALLE
   add constraint FK_COTIZACI_REFERENCE_COTIZACI foreign key (COT_ID)
      references COTIZACIONES (ID)
      on delete restrict on update restrict;

alter table EQUIPOS_AC
   add constraint FK_EQUIPOS__REFERENCE_MARCA foreign key (MAR_ID)
      references MARCA (ID)
      on delete restrict on update restrict;

alter table EQUIPOS_AC
   add constraint FK_EQUIPOS__REFERENCE_CLIENTES foreign key (CLI_ID)
      references CLIENTES (ID)
      on delete restrict on update restrict;

alter table INVENTARIO
   add constraint FK_INVENTAR_REFERENCE_CATEGORI foreign key (CAT_ID)
      references CATEGORIA_INVENTARIO (ID)
      on delete restrict on update restrict;

alter table MANTENIMIENTO_PREVENTIVO
   add constraint FK_MANTENIM_REFERENCE_EQUIPOS_ foreign key (EQU_ID)
      references EQUIPOS_AC (ID)
      on delete restrict on update restrict;

alter table MANTENIMIENTO_PREVENTIVO
   add constraint FK_MANTENIM_REFERENCE_CLIENTES foreign key (CLI_ID)
      references CLIENTES (ID)
      on delete restrict on update restrict;

alter table MOVIMIENTOS_INVENTARIO
   add constraint FK_MOVIMIEN_REFERENCE_INVENTAR foreign key (INV_ID)
      references INVENTARIO (ID)
      on delete restrict on update restrict;

alter table MOVIMIENTOS_INVENTARIO
   add constraint FK_MOVIMIEN_REFERENCE_USUARIOS foreign key (USU_ID)
      references USUARIOS (ID)
      on delete restrict on update restrict;

alter table MOVIMIENTOS_INVENTARIO
   add constraint FK_MOVIMIEN_REFERENCE_ORDENES_ foreign key (ORD_ID)
      references ORDENES_SERVICIO (ID)
      on delete restrict on update restrict;

alter table MOVIMIENTOS_INVENTARIO
   add constraint FK_MOVIMIEN_REFERENCE_TIPOS_MO foreign key (TIP_ID)
      references TIPOS_MOVIMIENTO_INVENTARIO (ID)
      on delete restrict on update restrict;

alter table NOTIFICACIONES
   add constraint FK_NOTIFICA_REFERENCE_USUARIOS foreign key (USU_ID)
      references USUARIOS (ID)
      on delete restrict on update restrict;

alter table OAUTH_CUENTAS
   add constraint FK_OAUTH_CU_REFERENCE_USUARIOS foreign key (USU_ID)
      references USUARIOS (ID)
      on delete restrict on update restrict;

alter table ORDENES_SERVICIO
   add constraint FK_ORDENES__REFERENCE_CLIENTES foreign key (CLI_ID)
      references CLIENTES (ID)
      on delete restrict on update restrict;

alter table ORDENES_SERVICIO
   add constraint FK_ORDENES__REFERENCE_EQUIPOS_ foreign key (EQU_ID)
      references EQUIPOS_AC (ID)
      on delete restrict on update restrict;

alter table ORDENES_SERVICIO
   add constraint FK_ORDENES__REFERENCE_CATEGORI foreign key (CAT_ID)
      references CATEGORIA_SERVICIO (ID)
      on delete restrict on update restrict;

alter table ORDENES_SERVICIO
   add constraint FK_ORDENES__REFERENCE_PRIORIDA foreign key (PRI_ID)
      references PRIORIDAD (ID)
      on delete restrict on update restrict;

alter table ORDENES_SERVICIO
   add constraint FK_ORDENES__REFERENCE_TECNICOS foreign key (TEC_ID)
      references TECNICOS (ID)
      on delete restrict on update restrict;

alter table PAGOS
   add constraint FK_PAGOS_REFERENCE_COTIZACI foreign key (COT_ID)
      references COTIZACIONES (ID)
      on delete restrict on update restrict;

alter table PAGOS
   add constraint FK_PAGOS_REFERENCE_ORDENES_ foreign key (ORD_ID)
      references ORDENES_SERVICIO (ID)
      on delete restrict on update restrict;

alter table PAGOS
   add constraint FK_PAGOS_REFERENCE_CLIENTES foreign key (CLI_ID)
      references CLIENTES (ID)
      on delete restrict on update restrict;

alter table RUTAS
   add constraint FK_RUTAS_REFERENCE_TECNICOS foreign key (TECNICO_ID)
      references TECNICOS (ID)
      on delete restrict on update restrict;

alter table RUTA_PARADAS
   add constraint FK_RUTA_PAR_REFERENCE_RUTAS foreign key (RUT_ID)
      references RUTAS (ID)
      on delete restrict on update restrict;

alter table RUTA_PARADAS
   add constraint FK_RUTA_PAR_REFERENCE_ORDENES_ foreign key (ORD_ID)
      references ORDENES_SERVICIO (ID)
      on delete restrict on update restrict;

alter table SESIONES
   add constraint FK_SESIONES_REFERENCE_USUARIOS foreign key (USU_ID)
      references USUARIOS (ID)
      on delete restrict on update restrict;

alter table TECNICOS
   add constraint FK_TECNICOS_REFERENCE_ESPECIAL foreign key (ESP_ID)
      references ESPECIALIDAD (ID)
      on delete restrict on update restrict;

alter table TECNICOS
   add constraint FK_TECNICOS_REFERENCE_USUARIOS foreign key (USU_ID)
      references USUARIOS (ID)
      on delete restrict on update restrict;

alter table USUARIOS
   add constraint FK_USUARIOS_REFERENCE_ROLES foreign key (ROL_ID)
      references ROLES (ID)
      on delete restrict on update restrict;

