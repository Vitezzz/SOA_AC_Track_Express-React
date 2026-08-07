/*==============================================================*/
/* Migration: 001_checklist_ejecucion_item_id                   */
/* Hybrid fix for CHECKLIST_EJECUCION: link executions to a real */
/* CHECKLIST_ITEMS_PLANTILLA row when the item comes from the    */
/* template, while still allowing a free-text ITEM_DESC for      */
/* ad-hoc items the técnico adds that aren't in the template.    */
/* Exactly one of ITEM_ID / ITEM_DESC must be set per row.       */
/*==============================================================*/

ALTER TABLE CHECKLIST_EJECUCION
    ADD COLUMN ITEM_ID INT2 NULL;

ALTER TABLE CHECKLIST_EJECUCION
    ADD CONSTRAINT FK_CHECKLIST_EJECUCION_ITEM FOREIGN KEY (ITEM_ID)
        REFERENCES CHECKLIST_ITEMS_PLANTILLA (ID)
        ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE CHECKLIST_EJECUCION
    ADD CONSTRAINT CHK_CHECKLIST_EJECUCION_ITEM_XOR_DESC
        CHECK (
            (ITEM_ID IS NOT NULL AND ITEM_DESC IS NULL)
            OR (ITEM_ID IS NULL AND ITEM_DESC IS NOT NULL)
        );
