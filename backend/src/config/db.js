const { Pool } = require('pg');
require('dotenv').config();

let pool;

if (process.env.MOCK_MODE === 'true') {
  console.log('⚠️ Running in local MOCK MODE (No real database connection)');
  
  // In-memory mock database
  const MOCK_USERS = [
    {
      id: 1,
      nombre: 'SuperAdmin',
      apellido: 'Sistema',
      email: 'superadmin@rubato.org',
      username: 'superadmin.sistema01',
      role: 'ADMIN',
      especialidad: null,
      // hash for password: "Rubato.2026*"
      password_hash: '$2a$10$rMTViB5aFPvqITr.pz0UMuil4gv4L.ekhSW5E69R6OuU7z3/goUDu',
      password_encrypted: '5817c1bf0f195dcfd2fbe3c16acb8791:9b08f4c28fcdbe794fb21edb01cfbf27'
    }
  ];

  const MOCK_CICLOS = [];
  const MOCK_CLASSES = [];
  const MOCK_CLASE_ESTUDIANTES = [];
  const MOCK_ATTENDANCE = [];
  const MOCK_GRADES = [];

  const mockQuery = async (text, params = []) => {
    const textUpper = text.toUpperCase();

    // 1. Insert queries
    if (textUpper.includes('INSERT INTO USERS')) {
      const newUser = {
        id: MOCK_USERS.length + 1,
        nombre: params[0],
        apellido: params[1],
        email: params[2],
        username: params[3],
        role: params[4],
        especialidad: params[5] || null,
        birthdate: params[6] || null,
        age: params[7] ? parseInt(params[7], 10) : null,
        instrument: params[8] || null,
        module: params[9] || null,
        semester: params[10] || null,
        phone: params[11] || null,
        password_hash: params[12] || '$2a$10$rMTViB5aFPvqITr.pz0UMuil4gv4L.ekhSW5E69R6OuU7z3/goUDu',
        password_encrypted: params[13] || '5817c1bf0f195dcfd2fbe3c16acb8791:9b08f4c28fcdbe794fb21edb01cfbf27'
      };
      MOCK_USERS.push(newUser);
      return { rows: [{ id: newUser.id }] };
    }

    if (textUpper.includes('INSERT INTO CICLOS')) {
      const newCycle = {
        id: MOCK_CICLOS.length + 1,
        nombre: params[0],
        semestre: params[1] || null,
        anio: params[2] ? parseInt(params[2], 10) : null,
        fecha_inicio: params[3],
        fecha_fin: params[4],
        estado: 'ABIERTO',
        is_open: true
      };
      MOCK_CICLOS.push(newCycle);
      return { rows: [{ id: newCycle.id }] };
    }

    if (textUpper.includes('INSERT INTO CLASSES')) {
      const newClass = {
        id: MOCK_CLASSES.length + 100,
        asignatura: params[0],
        modulo: params[1],
        semestre: params[2],
        profesor_nombre: params[3],
        profesor_titulo: params[4],
        dia_semana: params[5],
        horario: params[6],
        hora_inicio: params[7],
        hora_fin: params[8],
        aula: params[9],
        nota: params[10] || 'N/A',
        asistencia: params[11] || '100%',
        docente_id: parseInt(params[12], 10),
        ciclo_id: parseInt(params[13], 10)
      };
      MOCK_CLASSES.push(newClass);
      return { rows: [{ id: newClass.id }] };
    }

    if (textUpper.includes('INSERT INTO CLASE_ESTUDIANTES')) {
      for (let i = 0; i < params.length; i += 2) {
        const clase_id = parseInt(params[i], 10);
        const estudiante_id = parseInt(params[i + 1], 10);
        if (!clase_id || !estudiante_id) continue;
        const exists = MOCK_CLASE_ESTUDIANTES.some(ce => ce.clase_id === clase_id && ce.estudiante_id === estudiante_id);
        if (!exists) {
          MOCK_CLASE_ESTUDIANTES.push({ clase_id, estudiante_id });
        }
      }
      return { rowCount: params.length / 2, rows: [] };
    }

    if (textUpper.includes('INSERT INTO ATTENDANCE')) {
      const class_id = parseInt(params[0], 10);
      const estudiante_id = parseInt(params[1], 10);
      const student_name = params[2];
      const fecha = params[3];
      const asistencia = params[4];
      const idx = MOCK_ATTENDANCE.findIndex(a => a.class_id === class_id && a.estudiante_id === estudiante_id && a.fecha === fecha);
      if (idx !== -1) {
        MOCK_ATTENDANCE[idx].asistencia = asistencia;
        MOCK_ATTENDANCE[idx].student_name = student_name;
      } else {
        MOCK_ATTENDANCE.push({ id: MOCK_ATTENDANCE.length + 1, class_id, estudiante_id, student_name, fecha, asistencia });
      }
      return { rowCount: 1, rows: [] };
    }

    if (textUpper.includes('INSERT INTO GRADES')) {
      const class_id = parseInt(params[0], 10);
      const estudiante_id = parseInt(params[1], 10);
      const student_name = params[2];
      const corte1 = params[3] !== null && params[3] !== undefined ? parseFloat(params[3]) : null;
      const corte2 = params[4] !== null && params[4] !== undefined ? parseFloat(params[4]) : null;
      const nota_final = params[5] !== null && params[5] !== undefined ? parseFloat(params[5]) : null;
      const idx = MOCK_GRADES.findIndex(g => g.class_id === class_id && g.estudiante_id === estudiante_id);
      if (idx !== -1) {
        MOCK_GRADES[idx].corte1 = corte1;
        MOCK_GRADES[idx].corte2 = corte2;
        MOCK_GRADES[idx].nota_final = nota_final;
        MOCK_GRADES[idx].student_name = student_name;
      } else {
        MOCK_GRADES.push({ id: MOCK_GRADES.length + 1, class_id, estudiante_id, student_name, corte1, corte2, nota_final });
      }
      return { rowCount: 1, rows: [] };
    }

    // 2. Delete queries
    if (textUpper.includes('DELETE FROM USERS')) {
      const id = parseInt(params[0], 10);
      const idx = MOCK_USERS.findIndex(u => u.id === id);
      if (idx !== -1) MOCK_USERS.splice(idx, 1);
      return { rowCount: 1 };
    }

    if (textUpper.includes('DELETE FROM CICLOS')) {
      const id = parseInt(params[0], 10);
      const idx = MOCK_CICLOS.findIndex(c => c.id === id);
      if (idx !== -1) MOCK_CICLOS.splice(idx, 1);
      return { rowCount: 1 };
    }

    if (textUpper.includes('DELETE FROM CLASSES')) {
      const id = parseInt(params[0], 10);
      const idx = MOCK_CLASSES.findIndex(c => c.id === id);
      if (idx !== -1) MOCK_CLASSES.splice(idx, 1);
      return { rowCount: 1 };
    }

    if (textUpper.includes('DELETE FROM CLASE_ESTUDIANTES')) {
      const classId = parseInt(params[0], 10);
      for (let i = MOCK_CLASE_ESTUDIANTES.length - 1; i >= 0; i--) {
        if (MOCK_CLASE_ESTUDIANTES[i].clase_id === classId) {
          MOCK_CLASE_ESTUDIANTES.splice(i, 1);
        }
      }
      return { rowCount: 1 };
    }

    // 3. Update queries
    if (textUpper.includes('UPDATE CICLOS')) {
      const id = parseInt(params[params.length - 1], 10);
      const found = MOCK_CICLOS.find(c => c.id === id);
      if (found) {
        if (textUpper.includes("ESTADO = 'CERRADO'")) {
          found.estado = 'CERRADO';
          found.cerrado_por = parseInt(params[0], 10);
          found.cerrado_en = new Date().toISOString();
          found.is_open = false;
        } else {
          if (params[0] !== undefined) found.nombre = params[0];
          if (params[1] !== undefined) found.semestre = params[1];
          if (params[2] !== undefined) found.anio = parseInt(params[2], 10);
          if (params[3] !== undefined) found.fecha_inicio = params[3];
          if (params[4] !== undefined) found.fecha_fin = params[4];
        }
      }
      return { rowCount: 1, rows: found ? [found] : [] };
    }

    if (textUpper.includes('UPDATE CLASSES')) {
      const id = parseInt(params[params.length - 1], 10);
      const found = MOCK_CLASSES.find(c => c.id === id);
      if (found) {
        found.asignatura = params[0] || found.asignatura;
        found.modulo = params[1] || found.modulo;
        found.semestre = params[2] || found.semestre;
        found.profesor_nombre = params[3] || found.profesor_nombre;
        found.dia_semana = params[4] || found.dia_semana;
        found.horario = params[5] || found.horario;
        found.hora_inicio = params[6] || found.hora_inicio;
        found.hora_fin = params[7] || found.hora_fin;
        found.aula = params[8] || found.aula;
      }
      return { rowCount: 1, rows: found ? [found] : [] };
    }

    // 4. Select / Read queries
    if (textUpper.includes('FROM USERS')) {
      if (textUpper.includes('LOWER(USERNAME) = LOWER($1)')) {
        const iden = params[0].toLowerCase();
        const found = MOCK_USERS.find(u => u.username.toLowerCase() === iden || u.email.toLowerCase() === iden);
        return { rows: found ? [found] : [] };
      }
      if (textUpper.includes('PASSWORD_ENCRYPTED') && textUpper.includes('WHERE ID = $1')) {
        const found = MOCK_USERS.find(u => u.id === parseInt(params[0], 10));
        return { rows: found ? [{ password_encrypted: found.password_encrypted }] : [] };
      }
      if (textUpper.includes('ROLE = $1')) {
        const role = String(params[0]).toUpperCase();
        const list = MOCK_USERS.filter(u => u.role === role);
        return { rows: list };
      }
      return { rows: MOCK_USERS };
    }

    if (textUpper.includes('FROM CICLOS')) {
      if (textUpper.includes('WHERE ID = $1')) {
        const found = MOCK_CICLOS.find(c => c.id === parseInt(params[0], 10));
        return { rows: found ? [found] : [] };
      }
      return { rows: MOCK_CICLOS };
    }

    if (textUpper.includes('FROM CLASSES')) {
      if (textUpper.includes('WHERE C.DOCENTE_ID = $1')) {
        const list = MOCK_CLASSES.filter(c => c.docente_id === parseInt(params[0], 10));
        return { rows: list };
      }
      if (textUpper.includes('WHERE CE.ESTUDIANTE_ID = $1')) {
        const matchedClassIds = MOCK_CLASE_ESTUDIANTES.filter(ce => ce.estudiante_id === parseInt(params[0], 10)).map(ce => ce.clase_id);
        const list = MOCK_CLASSES.filter(c => matchedClassIds.includes(c.id));
        return { rows: list };
      }
      return { rows: MOCK_CLASSES };
    }

    if (textUpper.includes('FROM CLASE_ESTUDIANTES')) {
      if (textUpper.includes('WHERE CE.CLASE_ID = ANY($1)')) {
        const classIds = params[0] || [];
        const joins = [];
        MOCK_CLASE_ESTUDIANTES.forEach(ce => {
          if (classIds.includes(ce.clase_id)) {
            const student = MOCK_USERS.find(u => u.id === ce.estudiante_id);
            if (student) {
              joins.push({
                clase_id: ce.clase_id,
                estudiante_id: ce.estudiante_id,
                nombre: student.nombre,
                apellido: student.apellido
              });
            }
          }
        });
        return { rows: joins };
      }
    }

    if (textUpper.includes('FROM ATTENDANCE')) {
      if (textUpper.includes('WHERE CLASS_ID = $1 AND ESTUDIANTE_ID = $2')) {
        const list = MOCK_ATTENDANCE.filter(a => a.class_id === parseInt(params[0], 10) && a.estudiante_id === parseInt(params[1], 10));
        return { rows: list };
      }
      if (textUpper.includes('WHERE ESTUDIANTE_ID = $1')) {
        const list = MOCK_ATTENDANCE.filter(a => a.estudiante_id === parseInt(params[0], 10));
        return { rows: list };
      }
      if (textUpper.includes('WHERE CLASS_ID = $1')) {
        const list = MOCK_ATTENDANCE.filter(a => a.class_id === parseInt(params[0], 10));
        return { rows: list };
      }
      return { rows: MOCK_ATTENDANCE };
    }

    if (textUpper.includes('FROM GRADES')) {
      if (textUpper.includes('WHERE CLASS_ID = $1 AND ESTUDIANTE_ID = $2')) {
        const list = MOCK_GRADES.filter(g => g.class_id === parseInt(params[0], 10) && g.estudiante_id === parseInt(params[1], 10));
        return { rows: list };
      }
      if (textUpper.includes('WHERE ESTUDIANTE_ID = $1')) {
        const list = MOCK_GRADES.filter(g => g.estudiante_id === parseInt(params[0], 10));
        return { rows: list };
      }
      if (textUpper.includes('WHERE CLASS_ID = $1')) {
        const list = MOCK_GRADES.filter(g => g.class_id === parseInt(params[0], 10));
        return { rows: list };
      }
      return { rows: MOCK_GRADES };
    }

    return { rowCount: 0, rows: [] };
  };

  pool = {
    query: mockQuery,
    connect: async () => ({
      query: mockQuery,
      release: () => {}
    })
  };
} else {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
}

async function testConnection() {
  if (process.env.MOCK_MODE === 'true') {
    console.log('✅ Conexión simulada a PostgreSQL (MOCK_MODE habilitado)');
    return;
  }
  try {
    const client = await pool.connect();
    console.log('✅ Conexión exitosa a PostgreSQL (Supabase)');
    client.release();
  } catch (error) {
    console.error('❌ Error de conexión a PostgreSQL:', error.message);
  }
}

module.exports = { pool, testConnection };
