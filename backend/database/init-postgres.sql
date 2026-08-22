-- database/init-postgres.sql
-- Script consolidado de inicialización de base de datos para Portal Estudiante Rubato (PostgreSQL)

-- 1. Table users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  username VARCHAR(100) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'DOCENTE', 'ESTUDIANTE')),
  phone VARCHAR(20) NULL,
  especialidad VARCHAR(150) NULL,
  birthdate DATE NULL,
  age INT NULL,
  instrument VARCHAR(100) NULL,
  module VARCHAR(50) NULL,
  semester VARCHAR(50) NULL,
  password_hash VARCHAR(255) NOT NULL,
  password_encrypted TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table ciclos
CREATE TABLE IF NOT EXISTS ciclos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  semestre VARCHAR(10) NULL CHECK (semestre IN ('1', '2')),
  anio SMALLINT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'ABIERTO' CHECK (estado IN ('ABIERTO', 'CERRADO')),
  cerrado_en TIMESTAMP NULL,
  cerrado_por INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ciclos_cerrado_por FOREIGN KEY (cerrado_por) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_ciclos_estado ON ciclos (estado);

-- 3. Table classes
CREATE TABLE IF NOT EXISTS classes (
  id SERIAL PRIMARY KEY,
  docente_id INT NOT NULL,
  ciclo_id INT NULL,
  asignatura VARCHAR(150) NOT NULL,
  modulo VARCHAR(50) DEFAULT 'Módulo 1',
  semestre VARCHAR(50) DEFAULT 'Módulo 1-1',
  profesor_nombre VARCHAR(150) NOT NULL,
  profesor_titulo VARCHAR(50) DEFAULT 'profesor',
  dia_semana VARCHAR(15) NULL,
  horario VARCHAR(100) NOT NULL,
  hora_inicio TIME NULL,
  hora_fin TIME NULL,
  aula VARCHAR(50) NOT NULL DEFAULT 'Sala 1',
  nota VARCHAR(20) DEFAULT 'N/A',
  asistencia VARCHAR(20) DEFAULT '100%',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_classes_docente FOREIGN KEY (docente_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_classes_ciclo FOREIGN KEY (ciclo_id) REFERENCES ciclos(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_classes_docente ON classes (docente_id);
CREATE INDEX IF NOT EXISTS idx_classes_ciclo ON classes (ciclo_id);

-- 4. Table clase_estudiantes
CREATE TABLE IF NOT EXISTS clase_estudiantes (
  id SERIAL PRIMARY KEY,
  clase_id INT NOT NULL,
  estudiante_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_clase_estudiante UNIQUE (clase_id, estudiante_id),
  CONSTRAINT fk_ce_clase FOREIGN KEY (clase_id) REFERENCES classes(id) ON DELETE CASCADE,
  CONSTRAINT fk_ce_estudiante FOREIGN KEY (estudiante_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Table attendance
CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  class_id BIGINT NOT NULL,
  estudiante_id INT NOT NULL,
  student_name VARCHAR(150) NOT NULL,
  fecha DATE NOT NULL,
  asistencia VARCHAR(10) NOT NULL CHECK (asistencia IN ('P', 'A')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uniq_attendance UNIQUE (class_id, estudiante_id, fecha),
  CONSTRAINT fk_attendance_estudiante FOREIGN KEY (estudiante_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_att_estudiante_id ON attendance (estudiante_id);
CREATE INDEX IF NOT EXISTS idx_attendance_class_student ON attendance (class_id, estudiante_id);

-- 6. Table grades
CREATE TABLE IF NOT EXISTS grades (
  id SERIAL PRIMARY KEY,
  class_id BIGINT NOT NULL,
  estudiante_id INT NOT NULL,
  student_name VARCHAR(150) NOT NULL,
  corte1 DECIMAL(3,1) NULL,
  corte2 DECIMAL(3,1) NULL,
  nota_final DECIMAL(3,1) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uniq_grade UNIQUE (class_id, estudiante_id),
  CONSTRAINT fk_grades_estudiante FOREIGN KEY (estudiante_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_grades_estudiante_id ON grades (estudiante_id);
CREATE INDEX IF NOT EXISTS idx_grades_class_student ON grades (class_id, estudiante_id);

-- 7. Datos Semilla Indispensables
-- Nota: La contraseña para todos es 'Rubato.2026*'
-- Bcrypt Hash y AES-256 Encrypted (Formato iv:ciphertext)
INSERT INTO users (id, nombre, apellido, email, username, role, phone, especialidad, password_hash, password_encrypted) VALUES
(1, 'Admin', 'Rubato', 'admin@rubato.org', 'admin.rubato01', 'ADMIN', '3001234567', NULL, '$2a$10$rMTViB5aFPvqITr.pz0UMuil4gv4L.ekhSW5E69R6OuU7z3/goUDu', '5817c1bf0f195dcfd2fbe3c16acb8791:9b08f4c28fcdbe794fb21edb01cfbf27'),
(2, 'SuperAdmin', 'Sistema', 'superadmin@rubato.org', 'superadmin.sistema01', 'ADMIN', '3001234568', NULL, '$2a$10$rMTViB5aFPvqITr.pz0UMuil4gv4L.ekhSW5E69R6OuU7z3/goUDu', '5817c1bf0f195dcfd2fbe3c16acb8791:9b08f4c28fcdbe794fb21edb01cfbf27'),
(3, 'Carlos', 'Silva', 'carlos.silva@rubato.org', 'carlos.silva01', 'DOCENTE', '3001234569', 'Piano y Dirección de Orquesta', '$2a$10$rMTViB5aFPvqITr.pz0UMuil4gv4L.ekhSW5E69R6OuU7z3/goUDu', '5817c1bf0f195dcfd2fbe3c16acb8791:9b08f4c28fcdbe794fb21edb01cfbf27'),
(4, 'María', 'Fernández', 'maria.fernandez@rubato.org', 'maria.fernandez01', 'DOCENTE', '3001234570', 'Teoría Musical y Solfeo', '$2a$10$rMTViB5aFPvqITr.pz0UMuil4gv4L.ekhSW5E69R6OuU7z3/goUDu', '5817c1bf0f195dcfd2fbe3c16acb8791:9b08f4c28fcdbe794fb21edb01cfbf27'),
(5, 'Ana María', 'Gómez', 'ana.gomez@rubato.org', 'ana.gomez01', 'ESTUDIANTE', '3001234571', NULL, '$2a$10$rMTViB5aFPvqITr.pz0UMuil4gv4L.ekhSW5E69R6OuU7z3/goUDu', '5817c1bf0f195dcfd2fbe3c16acb8791:9b08f4c28fcdbe794fb21edb01cfbf27'),
(6, 'Luis', 'Pérez', 'luis.perez@rubato.org', 'luis.perez01', 'ESTUDIANTE', '3001234572', NULL, '$2a$10$rMTViB5aFPvqITr.pz0UMuil4gv4L.ekhSW5E69R6OuU7z3/goUDu', '5817c1bf0f195dcfd2fbe3c16acb8791:9b08f4c28fcdbe794fb21edb01cfbf27')
ON CONFLICT (id) DO NOTHING;

-- Sincronizar secuencia de users
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id)+1 FROM users), 1), false);

INSERT INTO ciclos (id, nombre, semestre, anio, fecha_inicio, fecha_fin, estado) VALUES
(1, 'Semestre 1 - 2026', '1', 2026, '2026-01-15', '2026-06-30', 'ABIERTO')
ON CONFLICT (id) DO NOTHING;

SELECT setval('ciclos_id_seq', COALESCE((SELECT MAX(id)+1 FROM ciclos), 1), false);

INSERT INTO classes (id, docente_id, ciclo_id, asignatura, profesor_nombre, profesor_titulo, dia_semana, horario, hora_inicio, hora_fin, aula, nota, asistencia) VALUES
(101, 3, 1, 'Piano Complementario I', 'Maestro Carlos Silva', 'profesor', 'Lunes', 'Lunes 10:00 AM - 11:30 AM', '10:00:00', '11:30:00', 'Sala 4', '4.8', '95%'),
(102, 4, 1, 'Teoría y Solfeo Avanzado', 'Dra. María Fernández', 'profesora', 'Martes', 'Martes 02:00 PM - 04:00 PM', '14:00:00', '16:00:00', 'Auditorio Principal', '4.5', '90%'),
(103, 3, 1, 'Ensayo de Orquesta Filarmónica', 'Maestro Carlos Silva', 'director', 'Viernes', 'Viernes 03:00 PM - 06:00 PM', '15:00:00', '18:00:00', 'Teatro Rubato', '5.0', '100%')
ON CONFLICT (id) DO NOTHING;

SELECT setval('classes_id_seq', COALESCE((SELECT MAX(id)+1 FROM classes), 1), false);

INSERT INTO clase_estudiantes (clase_id, estudiante_id) VALUES
(101, 5),
(101, 6),
(102, 5),
(103, 6)
ON CONFLICT (clase_id, estudiante_id) DO NOTHING;

SELECT setval('clase_estudiantes_id_seq', COALESCE((SELECT MAX(id)+1 FROM clase_estudiantes), 1), false);
