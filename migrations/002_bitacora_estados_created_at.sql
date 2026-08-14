/*==============================================================*/
/* Migration: 002_bitacora_estados_created_at                   */
/* BITACORA_ESTADOS no tenía ninguna columna de fecha/hora -- no */
/* había forma de saber CUÁNDO pasó cada evento (tecnico_llego,  */
/* tecnico_en_camino, etc.), lo que hacía imposible calcular     */
/* cuánto tardó un servicio en campo para los reportes. Se llena */
/* desde la app (aFechaSinZona, ver utils/fechaLocal.js), no con */
/* el DEFAULT now() de Postgres -- la sesión de la base corre en */
/* UTC y esa columna se lee de vuelta como hora LOCAL, así que   */
/* un now() de la base se vería 6h adelantado (mismo bug ya      */
/* encontrado y corregido en PAGOS.CREATED_AT).                  */
/*==============================================================*/

ALTER TABLE BITACORA_ESTADOS
    ADD COLUMN CREATED_AT TIMESTAMP NULL;
