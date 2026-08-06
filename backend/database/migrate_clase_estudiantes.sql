-- database/migrate_clase_estudiantes.sql
-- Migración: Tabla intermedia clase_estudiantes para la relación muchos-a-muchos entre classes y users

USE rubato_db;

CREATE TABLE IF NOT EXISTS `clase_estudiantes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `clase_id` INT NOT NULL,
  `estudiante_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_clase_estudiante` (`clase_id`, `estudiante_id`),
  CONSTRAINT `fk_ce_clase` FOREIGN KEY (`clase_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ce_estudiante` FOREIGN KEY (`estudiante_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Poblar con la relación existente de las clases semilla (estudiantes id 5 y 6)
INSERT IGNORE INTO `clase_estudiantes` (`clase_id`, `estudiante_id`) VALUES
(101, 5),
(101, 6),
(102, 5),
(103, 6);
