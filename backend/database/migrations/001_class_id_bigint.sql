-- migrations/001_class_id_bigint.sql
-- Migración: class_id pasa de INT a BIGINT.
-- El frontend genera ids de clase con Date.now() (~13 dígitos), que exceden el rango de INT.
USE rubato_db;

ALTER TABLE attendance MODIFY class_id BIGINT NOT NULL;
ALTER TABLE grades    MODIFY class_id BIGINT NOT NULL;
