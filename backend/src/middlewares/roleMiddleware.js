// middlewares/roleMiddleware.js

/**
 * Middleware para autorización basada en roles (RBAC).
 * @param {string|string[]} allowedRoles - Rol(es) permitidos ('ADMIN', 'DOCENTE', 'ESTUDIANTE')
 */
function requireRole(allowedRoles) {
  return (req, res, next) => {
    // Si no hay usuario en el request (debería existir si pasó por authMiddleware)
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: 'No autorizado. Información de usuario faltante.' });
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    // Verificar si el rol del usuario está en la lista de roles permitidos
    // También permitimos a los roles legacy en minúsculas mientras se hace la transición
    const userRole = req.user.role.toUpperCase();
    
    const hasRole = roles.some(role => role.toUpperCase() === userRole);

    if (!hasRole) {
      return res.status(403).json({ 
        error: 'Prohibido. No tienes los permisos necesarios para realizar esta acción.' 
      });
    }

    next();
  };
}

module.exports = {
  requireRole
};
