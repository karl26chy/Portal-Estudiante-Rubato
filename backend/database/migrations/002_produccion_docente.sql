-- database/migrations/002_produccion_docente.sql
-- Migración para preparar el sistema para producción:
-- 1. Agregar docente_id a classes (relación real profesor-clase)
-- 2. Reemplazar student_name por estudiante_id en attendance y grades
-- 3. Actualizar constraints compuestos

USE rubato_db;

-- -----------------------------------------------------
-- 1. Agregar docente_id a la tabla classes
-- -----------------------------------------------------
ALTER TABLE `classes`
  ADD COLUMN `docente_id` INT NULL AFTER `id`,
  ADD INDEX `idx_docente_id` (`docente_id`);

-- Poblar docente_id existente matcheando profesor_nombre con users (nombre + apellido)
UPDATE `classes` c
JOIN `users` u ON (
  u.role = 'DOCENTE'
  AND (
    c.profesor_nombre LIKE CONCAT('%', u.nombre, '%')
    AND c.profesor_nombre LIKE CONCAT('%', u.apellido, '%')
  )
)
SET c.docente_id = u.id
WHERE c.docente_id IS NULL;

-- Para los que no matchearon, asignar al primer DOCENTE disponible
UPDATE `classes` c
SET c.docente_id = (SELECT MIN(id) FROM `users` WHERE role = 'DOCENTE')
WHERE c.docente_id IS NULL;

-- Hacer docente_id NOT NULL y FK
ALTER TABLE `classes`
  MODIFY `docente_id` INT NOT NULL,
  ADD CONSTRAINT `fk_classes_docente` FOREIGN KEY (`docente_id`) REFERENCES `users`(`id`) ON DELETE CASCADE;

-- -----------------------------------------------------
-- 2. Agregar estudiante_id a attendance
-- -----------------------------------------------------
ALTER TABLE `attendance`
  ADD COLUMN `estudiante_id` INT NULL AFTER `class_id`,
  ADD INDEX `idx_att_estudiante_id` (`estudiante_id`);

-- Poblar estudiante_id matcheando student_name con users (nombre + apellido)
UPDATE `attendance` a
JOIN `users` u ON (
  u.role = 'ESTUDIANTE'
  AND a.student_name = CONCAT(u.nombre, ' ', u.apellido)
)
SET a.estudiante_id = u.id
WHERE a.estudiante_id IS NULL;

-- Eliminar el UNIQUE viejo basado en student_name
ALTER TABLE `attendance`
  DROP INDEX `uniq_attendance`;

-- Recrear el UNIQUE con estudiante_id
ALTER TABLE `attendance`
  MODIFY `estudiante_id` INT NOT NULL,
  ADD UNIQUE KEY `uniq_attendance` (`class_id`, `estudiante_id`, `fecha`),
  ADD CONSTRAINT `fk_attendance_estudiante` FOREIGN KEY (`estudiante_id`) REFERENCES `users`(`id`) ON DELETE CASCADE;

-- -----------------------------------------------------
-- 3. Agregar estudiante_id a grades
-- -----------------------------------------------------
ALTER TABLE `grades`
  ADD COLUMN `estudiante_id` INT NULL AFTER `class_id`,
  ADD INDEX `idx_grades_estudiante_id` (`estudiante_id`);

-- Poblar estudiante_id matcheando student_name con users (nombre + apellido)
UPDATE `grades` g
JOIN `users` u ON (
  u.role = 'ESTUDIANTE'
  AND g.student_name = CONCAT(u.nombre, ' ', u.apellido)
)
SET g.estudiante_id = u.id
WHERE g.estudiante_id IS NULL;

-- Eliminar el UNIQUE viejo basado en student_name
ALTER TABLE `grades`
  DROP INDEX `uniq_grade`;

-- Recrear el UNIQUE con estudiante_id
ALTER TABLE `grades`
  MODIFY `estudiante_id` INT NOT NULL,
  ADD UNIQUE KEY `uniq_grade` (`class_id`, `estudiante_id`),
  ADD CONSTRAINT `fk_grades_estudiante` FOREIGN KEY (`estudiante_id`) REFERENCES `users`(`id`) ON DELETE CASCADE;

-- -----------------------------------------------------
-- 4. Agregar índices faltantes para queries frecuentes
-- -----------------------------------------------------
CREATE INDEX IF NOT EXISTS `idx_classes_docente` ON `classes`(`docente_id`);
CREATE INDEX IF NOT EXISTS `idx_attendance_class_student` ON `attendance`(`class_id`, `estudiante_id`);
CREATE INDEX IF NOT EXISTS `idx_grades_class_student` ON `grades`(`class_id`, `estudiante_id`);
