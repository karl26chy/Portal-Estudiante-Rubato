-- database/init.sql
-- Script consolidado de inicialización de base de datos para Portal Estudiante Rubato
--
-- Este archivo contiene la estructura completa y unificada para crear la base de datos
-- desde cero en el orden correcto:
-- 1. Base de datos `rubato_db`
-- 2. Tabla `users` (con teléfono, especialidad y campos completos)
-- 3. Tabla `ciclos` (con semestre, anio, fechas y estado)
-- 4. Tabla `classes` (con docente_id y ciclo_id)
-- 5. Tabla `clase_estudiantes` (relación muchos a muchos)
-- 6. Tabla `attendance` (registros de asistencia)
-- 7. Tabla `grades` (calificaciones de corte 1 y corte 2)
-- 8. Datos Semilla indispensables (usuarios, ciclo inicial, clases y matrículas)

CREATE DATABASE IF NOT EXISTS `rubato_db`;
USE `rubato_db`;

-- -----------------------------------------------------
-- 1. Table `users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `apellido` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `role` ENUM('ADMIN', 'DOCENTE', 'ESTUDIANTE') NOT NULL,
  `phone` VARCHAR(20) NULL,
  `especialidad` VARCHAR(150) NULL,
  `birthdate` DATE NULL,
  `age` INT NULL,
  `instrument` VARCHAR(100) NULL,
  `module` VARCHAR(50) NULL,
  `semester` VARCHAR(50) NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `password_encrypted` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- 2. Table `ciclos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ciclos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `semestre` ENUM('1', '2') NULL,
  `anio` SMALLINT NULL,
  `fecha_inicio` DATE NOT NULL,
  `fecha_fin` DATE NOT NULL,
  `estado` ENUM('ABIERTO', 'CERRADO') NOT NULL DEFAULT 'ABIERTO',
  `cerrado_en` TIMESTAMP NULL,
  `cerrado_por` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_ciclos_estado` (`estado`),
  CONSTRAINT `fk_ciclos_cerrado_por` FOREIGN KEY (`cerrado_por`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- 3. Table `classes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `classes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `docente_id` INT NOT NULL,
  `ciclo_id` INT NULL,
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
  INDEX `idx_classes_ciclo` (`ciclo_id`),
  CONSTRAINT `fk_classes_docente` FOREIGN KEY (`docente_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_classes_ciclo` FOREIGN KEY (`ciclo_id`) REFERENCES `ciclos`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- 4. Table `clase_estudiantes` (Relación muchos-a-muchos classes ↔ users)
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
-- 5. Table `attendance` (Registro de asistencia por clase, alumno y fecha)
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
-- 6. Table `grades` (Calificaciones Rubato: Corte 1 y Corte 2 al 50%)
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
-- 7. Datos Semilla Indispensables
-- -----------------------------------------------------

-- Datos Semilla para Usuarios
-- Nota: La contraseña para todos es 'Rubato.2026*'
-- Bcrypt Hash y AES-256 Encrypted (Formato iv:ciphertext)
INSERT INTO `users` (`id`, `nombre`, `apellido`, `email`, `username`, `role`, `phone`, `especialidad`, `password_hash`, `password_encrypted`) VALUES
(1, 'Admin', 'Rubato', 'admin@rubato.org', 'admin.rubato01', 'ADMIN', '3001234567', NULL, '$2a$10$rMTViB5aFPvqITr.pz0UMuil4gv4L.ekhSW5E69R6OuU7z3/goUDu', '5817c1bf0f195dcfd2fbe3c16acb8791:9b08f4c28fcdbe794fb21edb01cfbf27'),
(2, 'SuperAdmin', 'Sistema', 'superadmin@rubato.org', 'superadmin.sistema01', 'ADMIN', '3001234568', NULL, '$2a$10$rMTViB5aFPvqITr.pz0UMuil4gv4L.ekhSW5E69R6OuU7z3/goUDu', '5817c1bf0f195dcfd2fbe3c16acb8791:9b08f4c28fcdbe794fb21edb01cfbf27'),
(3, 'Carlos', 'Silva', 'carlos.silva@rubato.org', 'carlos.silva01', 'DOCENTE', '3001234569', 'Piano y Dirección de Orquesta', '$2a$10$rMTViB5aFPvqITr.pz0UMuil4gv4L.ekhSW5E69R6OuU7z3/goUDu', '5817c1bf0f195dcfd2fbe3c16acb8791:9b08f4c28fcdbe794fb21edb01cfbf27'),
(4, 'María', 'Fernández', 'maria.fernandez@rubato.org', 'maria.fernandez01', 'DOCENTE', '3001234570', 'Teoría Musical y Solfeo', '$2a$10$rMTViB5aFPvqITr.pz0UMuil4gv4L.ekhSW5E69R6OuU7z3/goUDu', '5817c1bf0f195dcfd2fbe3c16acb8791:9b08f4c28fcdbe794fb21edb01cfbf27'),
(5, 'Ana María', 'Gómez', 'ana.gomez@rubato.org', 'ana.gomez01', 'ESTUDIANTE', '3001234571', NULL, '$2a$10$rMTViB5aFPvqITr.pz0UMuil4gv4L.ekhSW5E69R6OuU7z3/goUDu', '5817c1bf0f195dcfd2fbe3c16acb8791:9b08f4c28fcdbe794fb21edb01cfbf27'),
(6, 'Luis', 'Pérez', 'luis.perez@rubato.org', 'luis.perez01', 'ESTUDIANTE', '3001234572', NULL, '$2a$10$rMTViB5aFPvqITr.pz0UMuil4gv4L.ekhSW5E69R6OuU7z3/goUDu', '5817c1bf0f195dcfd2fbe3c16acb8791:9b08f4c28fcdbe794fb21edb01cfbf27')
ON DUPLICATE KEY UPDATE `username`=`username`;

-- Datos Semilla para Ciclos Académicos
INSERT INTO `ciclos` (`id`, `nombre`, `semestre`, `anio`, `fecha_inicio`, `fecha_fin`, `estado`) VALUES
(1, 'Semestre 1 - 2026', '1', 2026, '2026-01-15', '2026-06-30', 'ABIERTO')
ON DUPLICATE KEY UPDATE `nombre`=`nombre`;

-- Datos Semilla para Clases (Asociadas al Ciclo 1)
INSERT INTO `classes` (`id`, `docente_id`, `ciclo_id`, `asignatura`, `profesor_nombre`, `profesor_titulo`, `dia_semana`, `horario`, `hora_inicio`, `hora_fin`, `aula`, `nota`, `asistencia`) VALUES
(101, 3, 1, 'Piano Complementario I', 'Maestro Carlos Silva', 'profesor', 'Lunes', 'Lunes 10:00 AM - 11:30 AM', '10:00:00', '11:30:00', 'Sala 4', '4.8', '95%'),
(102, 4, 1, 'Teoría y Solfeo Avanzado', 'Dra. María Fernández', 'profesora', 'Martes', 'Martes 02:00 PM - 04:00 PM', '14:00:00', '16:00:00', 'Auditorio Principal', '4.5', '90%'),
(103, 3, 1, 'Ensayo de Orquesta Filarmónica', 'Maestro Carlos Silva', 'director', 'Viernes', 'Viernes 03:00 PM - 06:00 PM', '15:00:00', '18:00:00', 'Teatro Rubato', '5.0', '100%')
ON DUPLICATE KEY UPDATE `asignatura`=`asignatura`;

-- Datos Semilla para clase_estudiantes (Estudiantes 5 y 6 inscritos en clases)
INSERT IGNORE INTO `clase_estudiantes` (`clase_id`, `estudiante_id`) VALUES
(101, 5),
(101, 6),
(102, 5),
(103, 6);
