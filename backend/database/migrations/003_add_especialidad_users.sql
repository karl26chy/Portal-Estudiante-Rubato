-- database/migrations/003_add_especialidad_users.sql
-- Migración: Agregar columna especialidad a la tabla users
USE rubato_db;

-- Agregar columna especialidad a users si no existe
DROP PROCEDURE IF EXISTS AddEspecialidadColumn;
DELIMITER //
CREATE PROCEDURE AddEspecialidadColumn()
BEGIN
  IF NOT EXISTS (
    SELECT * FROM information_schema.columns 
    WHERE table_schema = DATABASE()
      AND table_name = 'users' 
      AND column_name = 'especialidad'
  ) THEN
    ALTER TABLE `users` ADD COLUMN `especialidad` VARCHAR(150) NULL AFTER `role`;
  END IF;
END //
DELIMITER ;

CALL AddEspecialidadColumn();
DROP PROCEDURE IF EXISTS AddEspecialidadColumn;
