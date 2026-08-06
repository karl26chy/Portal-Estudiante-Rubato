// api/classApi.js - Cliente para el módulo de gestión de clases
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

export const getClasses = () =>
  apiFetch('/api/classes');

export const createClass = (classData) =>
  apiFetch('/api/classes', {
    method: 'POST',
    body: JSON.stringify(classData)
  });

export const updateClass = (id, classData) =>
  apiFetch(`/api/classes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(classData)
  });

export const deleteClass = (id) =>
  apiFetch(`/api/classes/${id}`, {
    method: 'DELETE'
  });

export const getClassStudents = (claseId) =>
  apiFetch(`/api/classes/${claseId}/students`);

export const removeStudentFromClass = (claseId, estudianteId) =>
  apiFetch(`/api/classes/${claseId}/students/${estudianteId}`, {
    method: 'DELETE'
  });
