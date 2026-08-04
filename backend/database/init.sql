-- database/init.sql
-- Script de inicialización de base de datos para Portal Estudiante Rubato

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
  `password_hash` VARCHAR(255) NOT NULL,
  `password_encrypted` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- Table `classes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `classes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `asignatura` VARCHAR(150) NOT NULL,
  `modulo` VARCHAR(50) DEFAULT 'Módulo 1',
  `semestre` VARCHAR(50) DEFAULT 'Módulo 1-1',
  `profesor_nombre` VARCHAR(150) NOT NULL,
  `profesor_titulo` VARCHAR(50) DEFAULT 'profesor',
  `horario` VARCHAR(100) NOT NULL,
  `hora_inicio` TIME NULL,
  `hora_fin` TIME NULL,
  `aula` VARCHAR(50) NOT NULL DEFAULT 'Sala 1',
  `nota` VARCHAR(20) DEFAULT 'N/A',
  `asistencia` VARCHAR(20) DEFAULT '100%',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- Seed Data
-- -----------------------------------------------------

-- Datos Semilla para Usuarios
-- Nota: La contraseña para todos es 'Rubato.2026*'
-- Bcrypt Hash y AES-256 Encrypted
INSERT INTO `users` (`id`, `nombre`, `apellido`, `email`, `username`, `role`, `password_hash`, `password_encrypted`) VALUES
(1, 'Admin', 'Rubato', 'admin@rubato.org', 'admin.rubato01', 'ADMIN', '$2a$10$rMTViB5aFPvqITr.pz0UMuil4gv4L.ekhSW5E69R6OuU7z3/goUDu', 'e45c86ac088742c022e930d26b6114c2'),
(2, 'SuperAdmin', 'Sistema', 'superadmin@rubato.org', 'superadmin.sistema01', 'ADMIN', '$2a$10$rMTViB5aFPvqITr.pz0UMuil4gv4L.ekhSW5E69R6OuU7z3/goUDu', 'e45c86ac088742c022e930d26b6114c2'),
(3, 'Carlos', 'Silva', 'carlos.silva@rubato.org', 'carlos.silva01', 'DOCENTE', '$2a$10$rMTViB5aFPvqITr.pz0UMuil4gv4L.ekhSW5E69R6OuU7z3/goUDu', 'e45c86ac088742c022e930d26b6114c2'),
(4, 'María', 'Fernández', 'maria.fernandez@rubato.org', 'maria.fernandez01', 'DOCENTE', '$2a$10$rMTViB5aFPvqITr.pz0UMuil4gv4L.ekhSW5E69R6OuU7z3/goUDu', 'e45c86ac088742c022e930d26b6114c2'),
(5, 'Ana María', 'Gómez', 'ana.gomez@rubato.org', 'ana.gomez01', 'ESTUDIANTE', '$2a$10$rMTViB5aFPvqITr.pz0UMuil4gv4L.ekhSW5E69R6OuU7z3/goUDu', 'e45c86ac088742c022e930d26b6114c2'),
(6, 'Luis', 'Pérez', 'luis.perez@rubato.org', 'luis.perez01', 'ESTUDIANTE', '$2a$10$rMTViB5aFPvqITr.pz0UMuil4gv4L.ekhSW5E69R6OuU7z3/goUDu', 'e45c86ac088742c022e930d26b6114c2')
ON DUPLICATE KEY UPDATE `username`=`username`;

-- Datos Semilla para Clases
INSERT INTO `classes` (`id`, `asignatura`, `profesor_nombre`, `profesor_titulo`, `horario`, `aula`, `nota`, `asistencia`) VALUES
(101, 'Piano Complementario I', 'Maestro Carlos Silva', 'profesor', 'Lunes y Miércoles 10:00 - 11:30 AM', 'Sala 4', '4.8', '95%'),
(102, 'Teoría y Solfeo Avanzado', 'Dra. María Fernández', 'profesora', 'Martes y Jueves 02:00 - 04:00 PM', 'Auditorio Principal', '4.5', '90%'),
(103, 'Ensayo de Orquesta Filarmónica', 'Maestro Carlos Silva', 'director', 'Viernes 03:00 - 06:00 PM', 'Teatro Rubato', '5.0', '100%')
ON DUPLICATE KEY UPDATE `asignatura`=`asignatura`;
