const { ROLES, canEditDelete } = require('./roles');

/**
 * Middleware to check if user has required role
 * @param {string[]} allowedRoles - Array of role names that are allowed
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).send({
        success: false,
        error: 'Authentication required'
      });
    }

    const userRole = req.user.role_name;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).send({
        success: false,
        error: `Access denied. Required roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};


const requireTeacherOrAdmin = requireRole([ROLES.TEACHER, ROLES.ADMIN]);


const requireAdmin = requireRole([ROLES.ADMIN]);


const requireTeacher = requireRole([ROLES.TEACHER]);

module.exports = {
  requireRole,
  requireTeacherOrAdmin,
  requireAdmin,
  requireTeacher
};

