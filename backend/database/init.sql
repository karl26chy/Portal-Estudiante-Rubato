-- database/init.sql
-- Script de inicialización de base de datos para Portal Estudiante Rubato

CREATE DATABASE IF NOT EXISTS rubato_db;
USE rubato_db;

-- -----------------------------------------------------
-- Table `users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario` VARCHAR(100) NOT NULL UNIQUE,
  `nombre` VARCHAR(100) NOT NULL,
  `role` VARCHAR(50) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- Table `classes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `classes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `asignatura` VARCHAR(150) NOT NULL,
  `profesor_nombre` VARCHAR(150) NOT NULL,
  `profesor_titulo` VARCHAR(50) DEFAULT 'profesor',
  `horario` VARCHAR(100) NOT NULL,
  `aula` VARCHAR(50) NOT NULL,
  `nota` VARCHAR(20) DEFAULT 'N/A',
  `asistencia` VARCHAR(20) DEFAULT '100%',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- Seed Data
-- -----------------------------------------------------

-- Datos Semilla para Usuarios
-- Nota: La contraseña para todos es '123456' hasheada con bcrypt (cost 10)
INSERT INTO `users` (`id`, `usuario`, `nombre`, `role`, `password_hash`) VALUES
(1, 'admin@rubato.org', 'Admin Fundación Rubato', 'admin', '$2a$10$wNnQ6iGntt6V1M7Wn4rD0eU3L.4Zk6.k2wW3T1g7Cj8I/i5D.Q3zG'),
(2, 'profesor@rubato.org', 'Maestro Carlos Silva', 'professor', '$2a$10$wNnQ6iGntt6V1M7Wn4rD0eU3L.4Zk6.k2wW3T1g7Cj8I/i5D.Q3zG'),
(3, 'estudiante@rubato.org', 'Ana María Gómez', 'student', '$2a$10$wNnQ6iGntt6V1M7Wn4rD0eU3L.4Zk6.k2wW3T1g7Cj8I/i5D.Q3zG')
ON DUPLICATE KEY UPDATE `usuario`=`usuario`;

-- Datos Semilla para Clases
INSERT INTO `classes` (`id`, `asignatura`, `profesor_nombre`, `profesor_titulo`, `horario`, `aula`, `nota`, `asistencia`) VALUES
(101, 'Piano Complementario I', 'Maestro Carlos Silva', 'profesor', 'Lunes y Miércoles 10:00 - 11:30 AM', 'Sala 4', '4.8', '95%'),
(102, 'Teoría y Solfeo Avanzado', 'Dra. María Fernández', 'profesora', 'Martes y Jueves 02:00 - 04:00 PM', 'Auditorio Principal', '4.5', '90%'),
(103, 'Ensayo de Orquesta Filarmónica', 'Maestro Carlos Silva', 'director', 'Viernes 03:00 - 06:00 PM', 'Teatro Rubato', '5.0', '100%')
ON DUPLICATE KEY UPDATE `asignatura`=`asignatura`;
