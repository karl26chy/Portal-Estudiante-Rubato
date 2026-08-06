// api/authApi.js - Cliente para el módulo de autenticación y usuarios
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

export const registerUser = (userData) =>
  apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });

export const updateUser = (id, userData) =>
  apiFetch(`/api/auth/user/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData)
  });

export const deleteUser = (id) =>
  apiFetch(`/api/auth/user/${id}`, {
    method: 'DELETE'
  });

export const getUsersByRole = (role) =>
  apiFetch(`/api/auth/users?role=${role}`);

export const getCredentials = (id) =>
  apiFetch(`/api/auth/credentials/${id}`);
