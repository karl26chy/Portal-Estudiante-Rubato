// utils/teacherUtils.js - Helpers compartidos para la vista del docente

export const normalizeText = (str = '') =>
  str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

export const getFullName = (item) => {
  if (!item) return '';
  if (item.nombre || item.apellido) {
    return `${(item.nombre || '')} ${(item.apellido || '')}`.trim();
  }
  if (item.name) return item.name.trim();
  return '';
};

export const getLastName = (name = '') => {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? parts[parts.length - 1] : (parts[0] || '');
};

export const sortByLastName = (list) =>
  [...list].sort((a, b) => {
    const aName = a.name || getFullName(a);
    const bName = b.name || getFullName(b);
    const aLast = getLastName(aName).toLowerCase();
    const bLast = getLastName(bName).toLowerCase();
    if (aLast < bLast) return -1;
    if (aLast > bLast) return 1;
    return aName.localeCompare(bName);
  });

export const getTodayISO = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const formatFecha = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

export const calcNotaFinal = (corte1, corte2) => {
  const c1 = Number(corte1);
  const c2 = Number(corte2);
  if (corte1 === null || corte1 === undefined || corte1 === '' ||
      corte2 === null || corte2 === undefined || corte2 === '' ||
      isNaN(c1) || isNaN(c2)) {
    return null;
  }
  return Math.round((c1 * 0.5 + c2 * 0.5) * 10) / 10;
};
