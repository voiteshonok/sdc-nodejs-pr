const ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin'
};


function canEdit(roleName) {
  return roleName === ROLES.TEACHER || roleName === ROLES.ADMIN;
}


function canDelete(roleName) {
  return roleName === ROLES.ADMIN;
}

/**
 * Check if a role has permission to edit/delete
 * Only teacher and admin can edit/delete
 * @deprecated Use canEdit() and canDelete() separately
 */
function canEditDelete(roleName) {
  return roleName === ROLES.TEACHER || roleName === ROLES.ADMIN;
}


function isAdmin(roleName) {
  return roleName === ROLES.ADMIN;
}


function isTeacher(roleName) {
  return roleName === ROLES.TEACHER;
}


function isStudent(roleName) {
  return roleName === ROLES.STUDENT;
}

module.exports = {
  ROLES,
  canEdit,
  canDelete,
  canEditDelete,
  isAdmin,
  isTeacher,
  isStudent
};

