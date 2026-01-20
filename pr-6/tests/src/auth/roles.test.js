const { ROLES, canEdit, canDelete, canEditDelete, isAdmin, isTeacher, isStudent } = require('../../../src/auth/roles');

describe('roles', () => {
  describe('ROLES constant', () => {
    it('should have correct role names', () => {
      expect(ROLES.STUDENT).toBe('student');
      expect(ROLES.TEACHER).toBe('teacher');
      expect(ROLES.ADMIN).toBe('admin');
    });
  });

  describe('canEdit', () => {
    it('should return true for teacher role', () => {
      expect(canEdit(ROLES.TEACHER)).toBe(true);
    });

    it('should return true for admin role', () => {
      expect(canEdit(ROLES.ADMIN)).toBe(true);
    });

    it('should return false for student role', () => {
      expect(canEdit(ROLES.STUDENT)).toBe(false);
    });

    it('should return false for invalid role', () => {
      expect(canEdit('invalid')).toBe(false);
      expect(canEdit(null)).toBe(false);
      expect(canEdit(undefined)).toBe(false);
    });
  });

  describe('canDelete', () => {
    it('should return true for admin role', () => {
      expect(canDelete(ROLES.ADMIN)).toBe(true);
    });

    it('should return false for teacher role', () => {
      expect(canDelete(ROLES.TEACHER)).toBe(false);
    });

    it('should return false for student role', () => {
      expect(canDelete(ROLES.STUDENT)).toBe(false);
    });

    it('should return false for invalid role', () => {
      expect(canDelete('invalid')).toBe(false);
      expect(canDelete(null)).toBe(false);
      expect(canDelete(undefined)).toBe(false);
    });
  });

  describe('canEditDelete', () => {
    it('should return true for teacher role', () => {
      expect(canEditDelete(ROLES.TEACHER)).toBe(true);
    });

    it('should return true for admin role', () => {
      expect(canEditDelete(ROLES.ADMIN)).toBe(true);
    });

    it('should return false for student role', () => {
      expect(canEditDelete(ROLES.STUDENT)).toBe(false);
    });

    it('should return false for invalid role', () => {
      expect(canEditDelete('invalid')).toBe(false);
      expect(canEditDelete(null)).toBe(false);
      expect(canEditDelete(undefined)).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin role', () => {
      expect(isAdmin(ROLES.ADMIN)).toBe(true);
    });

    it('should return false for teacher role', () => {
      expect(isAdmin(ROLES.TEACHER)).toBe(false);
    });

    it('should return false for student role', () => {
      expect(isAdmin(ROLES.STUDENT)).toBe(false);
    });

    it('should return false for invalid role', () => {
      expect(isAdmin('invalid')).toBe(false);
      expect(isAdmin(null)).toBe(false);
      expect(isAdmin(undefined)).toBe(false);
    });
  });

  describe('isTeacher', () => {
    it('should return true for teacher role', () => {
      expect(isTeacher(ROLES.TEACHER)).toBe(true);
    });

    it('should return false for admin role', () => {
      expect(isTeacher(ROLES.ADMIN)).toBe(false);
    });

    it('should return false for student role', () => {
      expect(isTeacher(ROLES.STUDENT)).toBe(false);
    });

    it('should return false for invalid role', () => {
      expect(isTeacher('invalid')).toBe(false);
      expect(isTeacher(null)).toBe(false);
      expect(isTeacher(undefined)).toBe(false);
    });
  });

  describe('isStudent', () => {
    it('should return true for student role', () => {
      expect(isStudent(ROLES.STUDENT)).toBe(true);
    });

    it('should return false for admin role', () => {
      expect(isStudent(ROLES.ADMIN)).toBe(false);
    });

    it('should return false for teacher role', () => {
      expect(isStudent(ROLES.TEACHER)).toBe(false);
    });

    it('should return false for invalid role', () => {
      expect(isStudent('invalid')).toBe(false);
      expect(isStudent(null)).toBe(false);
      expect(isStudent(undefined)).toBe(false);
    });
  });
});

