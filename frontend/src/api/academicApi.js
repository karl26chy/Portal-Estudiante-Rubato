// api/academicApi.js - Cliente para el módulo académico (asistencia y notas)
const apiFetch = async (path, options = {}) => {
  const response = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Error en la solicitud al servidor');
  }
  return response.json();
};

const withParams = (path, params) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') qs.set(key, value);
  });
  const str = qs.toString();
  return str ? `${path}?${str}` : path;
};

export const getAttendance = (classId, studentName) =>
  apiFetch(withParams('/api/academic/attendance', { classId, studentName }));

export const saveAttendance = (classId, fecha, records) =>
  apiFetch('/api/academic/attendance', {
    method: 'POST',
    body: JSON.stringify({ classId, fecha, records })
  });

export const getGrades = (classId, studentName) =>
  apiFetch(withParams('/api/academic/grades', { classId, studentName }));

export const saveGrades = (classId, records) =>
  apiFetch('/api/academic/grades', {
    method: 'POST',
    body: JSON.stringify({ classId, records })
  });
