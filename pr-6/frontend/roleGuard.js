/**
 * Frontend Role Guard Utilities
 */

// User Roles Enum
const ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin'
};

/**
 * Get current user from JWT token
 */
function getCurrentUser() {
  const token = localStorage.getItem('jwt_token');
  if (!token) {
    return null;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.id,
      name: payload.name,
      surname: payload.surname,
      email: payload.email,
      role_name: payload.role_name
    };
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
}

/**
 * Check if current user can edit
 * Teacher and admin can edit
 */
function canEdit() {
  const user = getCurrentUser();
  if (!user) {
    return false;
  }
  return user.role_name === ROLES.TEACHER || user.role_name === ROLES.ADMIN;
}

/**
 * Check if current user can delete
 * Only admin can delete
 */
function canDelete() {
  const user = getCurrentUser();
  if (!user) {
    return false;
  }
  return user.role_name === ROLES.ADMIN;
}

/**
 * Check if current user can edit/delete
 * Only teacher and admin can edit/delete
 * @deprecated Use canEdit() and canDelete() separately
 */
function canEditDelete() {
  const user = getCurrentUser();
  if (!user) {
    return false;
  }
  return user.role_name === ROLES.TEACHER || user.role_name === ROLES.ADMIN;
}

/**
 * Check if current user is admin
 */
function isAdmin() {
  const user = getCurrentUser();
  return user && user.role_name === ROLES.ADMIN;
}

/**
 * Check if current user is teacher
 */
function isTeacher() {
  const user = getCurrentUser();
  return user && user.role_name === ROLES.TEACHER;
}

/**
 * Check if current user is student
 */
function isStudent() {
  const user = getCurrentUser();
  return user && user.role_name === ROLES.STUDENT;
}

/**
 * Get current user role name
 */
function getCurrentUserRole() {
  const user = getCurrentUser();
  return user ? user.role_name : null;
}

