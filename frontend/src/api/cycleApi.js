// api/cycleApi.js - Cliente para el módulo de gestión de ciclos académicos
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

export const getCycles = () =>
  apiFetch('/api/cycles');

export const createCycle = (cycleData) =>
  apiFetch('/api/cycles', {
    method: 'POST',
    body: JSON.stringify(cycleData)
  });

export const updateCycle = (id, cycleData) =>
  apiFetch(`/api/cycles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(cycleData)
  });

export const closeCycle = (id) =>
  apiFetch(`/api/cycles/${id}/close`, {
    method: 'POST'
  });

export const deleteCycle = (id) =>
  apiFetch(`/api/cycles/${id}`, {
    method: 'DELETE'
  });
