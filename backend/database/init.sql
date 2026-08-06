-- database/init.sql
-- Script de inicialización de base de datos para Portal Estudiante Rubato
--
-- IMPORTANT:
-- A partir de ahora que el proyecto tiene una base de datos real en uso,
-- este archivo (init.sql) deja de poder editarse libremente cuando haya datos en producción.
-- Los próximos cambios de esquema deben ir en archivos nuevos dentro de
-- backend/database/migrations/, empezando de nuevo desde 001 (ej. 001_descripcion.sql),
-- y aplicarse manualmente contra la base de datos real en orden cronológico.

CREATE DATABASE IF NOT EXISTS rubato_db;
USE rubato_db;

-- -----------------------------------------------------
-- Table `users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `apellido` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `role` ENUM('ADMIN', 'DOCENTE', 'ESTUDIANTE') NOT NULL,
  `especialidad` VARCHAR(150) NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `password_encrypted` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `classes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `classes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `docente_id` INT NOT NULL,
  `asignatura` VARCHAR(150) NOT NULL,
  `modulo` VARCHAR(50) DEFAULT 'Módulo 1',
  `semestre` VARCHAR(50) DEFAULT 'Módulo 1-1',
  `profesor_nombre` VARCHAR(150) NOT NULL,
  `profesor_titulo` VARCHAR(50) DEFAULT 'profesor',
  `dia_semana` VARCHAR(15) NULL,
  `horario` VARCHAR(100) NOT NULL,
  `hora_inicio` TIME NULL,
  `hora_fin` TIME NULL,
  `aula` VARCHAR(50) NOT NULL DEFAULT 'Sala 1',
  `nota` VARCHAR(20) DEFAULT 'N/A',
  `asistencia` VARCHAR(20) DEFAULT '100%',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_classes_docente` (`docente_id`),
  CONSTRAINT `fk_classes_docente` FOREIGN KEY (`docente_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `clase_estudiantes` (Relación muchos-a-muchos classes ↔ users)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `clase_estudiantes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `clase_id` INT NOT NULL,
  `estudiante_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_clase_estudiante` (`clase_id`, `estudiante_id`),
  CONSTRAINT `fk_ce_clase` FOREIGN KEY (`clase_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ce_estudiante` FOREIGN KEY (`estudiante_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `attendance` (Registro de asistencia por clase, alumno y fecha)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `attendance` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `class_id` BIGINT NOT NULL,
  `estudiante_id` INT NOT NULL,
  `student_name` VARCHAR(150) NOT NULL,
  `fecha` DATE NOT NULL,
  `asistencia` ENUM('P', 'A') NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_attendance` (`class_id`, `estudiante_id`, `fecha`),
  INDEX `idx_att_estudiante_id` (`estudiante_id`),
  INDEX `idx_attendance_class_student` (`class_id`, `estudiante_id`),
  CONSTRAINT `fk_attendance_estudiante` FOREIGN KEY (`estudiante_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `grades` (Calificaciones Rubato: Corte 1 y Corte 2 al 50%)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `grades` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `class_id` BIGINT NOT NULL,
  `estudiante_id` INT NOT NULL,
  `student_name` VARCHAR(150) NOT NULL,
  `corte1` DECIMAL(3,1) NULL,
  `corte2` DECIMAL(3,1) NULL,
  `nota_final` DECIMAL(3,1) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_grade` (`class_id`, `estudiante_id`),
  INDEX `idx_grades_estudiante_id` (`estudiante_id`),
  INDEX `idx_grades_class_student` (`class_id`, `estudiante_id`),
  CONSTRAINT `fk_grades_estudiante` FOREIGN KEY (`estudiante_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Seed Data
-- -----------------------------------------------------

-- Datos Semilla para Usuarios
-- Nota: La contraseña para todos es 'Rubato.2026*'
-- Bcrypt Hash y AES-256 Encrypted
INSERT INTO `users` (`id`, `nombre`, `apellido`, `email`, `username`, `role`, `especialidad`, `password_hash`, `password_encrypted`) VALUES
(1, 'Admin', 'Rubato', 'admin@rubato.org', 'admin.rubato01', 'ADMIN', NULL, '$2a$10$rMTViB5aFPvqITr.pz0UMuil4gv4L.ekhSW5E69R6OuU7z3/goUDu', 'e45c86ac088742c022e930d26b6114c2'),
(2, 'SuperAdmin', 'Sistema', 'superadmin@rubato.org', 'superadmin.sistema01', 'ADMIN', NULL, '$2a$10$rMTViB5aFPvqITr.pz0UMuil4gv4L.ekhSW5E69R6OuU7z3/goUDu', 'e45c86ac088742c022e930d26b6114c2'),
(3, 'Carlos', 'Silva', 'carlos.silva@rubato.org', 'carlos.silva01', 'DOCENTE', 'Piano y Dirección de Orquesta', '$2a$10$rMTViB5aFPvqITr.pz0UMuil4gv4L.ekhSW5E69R6OuU7z3/goUDu', 'e45c86ac088742c022e930d26b6114c2'),
(4, 'María', 'Fernández', 'maria.fernandez@rubato.org', 'maria.fernandez01', 'DOCENTE', 'Teoría Musical y Solfeo', '$2a$10$rMTViB5aFPvqITr.pz0UMuil4gv4L.ekhSW5E69R6OuU7z3/goUDu', 'e45c86ac088742c022e930d26b6114c2'),
(5, 'Ana María', 'Gómez', 'ana.gomez@rubato.org', 'ana.gomez01', 'ESTUDIANTE', NULL, '$2a$10$rMTViB5aFPvqITr.pz0UMuil4gv4L.ekhSW5E69R6OuU7z3/goUDu', 'e45c86ac088742c022e930d26b6114c2'),
(6, 'Luis', 'Pérez', 'luis.perez@rubato.org', 'luis.perez01', 'ESTUDIANTE', NULL, '$2a$10$rMTViB5aFPvqITr.pz0UMuil4gv4L.ekhSW5E69R6OuU7z3/goUDu', 'e45c86ac088742c022e930d26b6114c2')
ON DUPLICATE KEY UPDATE `username`=`username`;

-- Datos Semilla para Clases
INSERT INTO `classes` (`id`, `docente_id`, `asignatura`, `profesor_nombre`, `profesor_titulo`, `dia_semana`, `horario`, `hora_inicio`, `hora_fin`, `aula`, `nota`, `asistencia`) VALUES
(101, 3, 'Piano Complementario I', 'Maestro Carlos Silva', 'profesor', 'Lunes', 'Lunes y Miércoles 10:00 - 11:30 AM', '10:00:00', '11:30:00', 'Sala 4', '4.8', '95%'),
(102, 4, 'Teoría y Solfeo Avanzado', 'Dra. María Fernández', 'profesora', 'Martes', 'Martes y Jueves 02:00 - 04:00 PM', '14:00:00', '16:00:00', 'Auditorio Principal', '4.5', '90%'),
(103, 3, 'Ensayo de Orquesta Filarmónica', 'Maestro Carlos Silva', 'director', 'Viernes', 'Viernes 03:00 - 06:00 PM', '15:00:00', '18:00:00', 'Teatro Rubato', '5.0', '100%')
ON DUPLICATE KEY UPDATE `asignatura`=`asignatura`;

-- Datos Semilla para clase_estudiantes (estudiantes id 5 y 6 inscritos en las clases 101-103)
INSERT IGNORE INTO `clase_estudiantes` (`clase_id`, `estudiante_id`) VALUES
(101, 5),
(101, 6),
(102, 5),
(103, 6);
