/*==============================================================*/
/* Migration: 003_categoria_servicio_precio_sugerido            */
/* Precio base opcional por categoría de servicio -- solo tiene */
/* sentido para servicios ESTANDARIZADOS (mantenimiento,        */
/* limpieza, revisión estándar), donde la mano de obra es fija  */
/* sin importar lo que se encuentre. Se deja NULL a propósito   */
/* en categorías de diagnóstico/reparación, donde el precio SÍ  */
/* depende de lo que el técnico encuentre en campo -- un precio */
/* por defecto ahí invitaría a cotizar a ciegas, que es          */
/* justo lo que se buscó evitar al mover la cotización a campo. */
/*==============================================================*/

ALTER TABLE CATEGORIA_SERVICIO
    ADD COLUMN PRECIO_SUGERIDO NUMERIC NULL;
