const { UserService } = require('../../../src/services/UserService');
const bcrypt = require('bcrypt');

// Mock bcrypt
jest.mock('bcrypt');

describe('UserService', () => {
  let userService;
  let mockUser;
  let mockRole;
  let mockSequelize;
  let mockDb;

  beforeEach(() => {
    // Mock Sequelize models
    mockUser = {
      findOne: jest.fn(),
      create: jest.fn(),
    };

    mockRole = {
      findOne: jest.fn(),
    };

    mockSequelize = {
      authenticate: jest.fn().mockResolvedValue(true),
    };

    mockDb = {
      sequelize: mockSequelize,
      User: mockUser,
      Student: {},
      Role: mockRole,
    };

    // Create UserService instance with mocked database
    userService = new UserService(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserByEmail', () => {
    it('should return user when user exists', async () => {
      // Arrange
      const email = 'test@example.com';
      const expectedUser = {
        id: 1,
        name: 'John',
        surname: 'Doe',
        email: email,
        role: 1,
        password: 'hashed_password'
      };

      mockUser.findOne.mockResolvedValue(expectedUser);

      // Act
      const result = await userService.getUserByEmail(email);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(mockSequelize.authenticate).toHaveBeenCalledTimes(1);
      expect(mockUser.findOne).toHaveBeenCalledWith({
        where: { email },
        raw: true
      });
      expect(mockUser.findOne).toHaveBeenCalledTimes(1);
    });

    it('should return null when user does not exist', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      mockUser.findOne.mockResolvedValue(null);

      // Act
      const result = await userService.getUserByEmail(email);

      // Assert
      expect(result).toBeNull();
      expect(mockUser.findOne).toHaveBeenCalledWith({
        where: { email },
        raw: true
      });
    });

    it('should call ensureConnected before querying', async () => {
      // Arrange
      const email = 'test@example.com';
      mockUser.findOne.mockResolvedValue(null);

      // Act
      await userService.getUserByEmail(email);

      // Assert
      expect(mockSequelize.authenticate).toHaveBeenCalledTimes(1);
      expect(mockUser.findOne).toHaveBeenCalled();
    });

    it('should only authenticate once even with multiple calls', async () => {
      // Arrange
      const email1 = 'test1@example.com';
      const email2 = 'test2@example.com';
      mockUser.findOne.mockResolvedValue(null);

      // Act
      await userService.getUserByEmail(email1);
      await userService.getUserByEmail(email2);

      // Assert
      expect(mockSequelize.authenticate).toHaveBeenCalledTimes(1);
    });
  });

  describe('verifyPassword', () => {
    it('should return true when password matches hashed password', async () => {
      // Arrange
      const password = 'plainPassword123';
      const hashedPassword = '$2b$10$hashedPasswordString';
      bcrypt.compare.mockResolvedValue(true);

      // Act
      const result = await userService.verifyPassword(password, hashedPassword);

      // Assert
      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(bcrypt.compare).toHaveBeenCalledTimes(1);
    });

    it('should return false when password does not match hashed password', async () => {
      // Arrange
      const password = 'wrongPassword';
      const hashedPassword = '$2b$10$hashedPasswordString';
      bcrypt.compare.mockResolvedValue(false);

      // Act
      const result = await userService.verifyPassword(password, hashedPassword);

      // Assert
      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(bcrypt.compare).toHaveBeenCalledTimes(1);
    });

    it('should call bcrypt.compare with correct arguments', async () => {
      // Arrange
      const password = 'testPassword';
      const hashedPassword = '$2b$10$anotherHashedPassword';
      bcrypt.compare.mockResolvedValue(true);

      // Act
      await userService.verifyPassword(password, hashedPassword);

      // Assert
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });
  });

  describe('getUserWithRoleByEmail', () => {
    it('should return user with role_name when user exists', async () => {
      // Arrange
      const email = 'test@example.com';
      const mockUserData = {
        id: 1,
        name: 'John',
        surname: 'Doe',
        email: email,
        role: 1,
        password: 'hashed_password'
      };
      const mockRoleData = {
        role_id: 1,
        role_name: 'student'
      };

      mockUser.findOne.mockResolvedValue(mockUserData);
      mockRole.findOne.mockResolvedValue(mockRoleData);

      // Act
      const result = await userService.getUserWithRoleByEmail(email);

      // Assert
      expect(result).toEqual({
        id: 1,
        name: 'John',
        surname: 'Doe',
        email: email,
        password: 'hashed_password',
        role: 1,
        role_name: 'student'
      });
      expect(mockUser.findOne).toHaveBeenCalledWith({
        where: { email },
        raw: true
      });
      expect(mockRole.findOne).toHaveBeenCalledWith({
        where: { role_id: 1 },
        raw: true
      });
    });

    it('should return null when user does not exist', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      mockUser.findOne.mockResolvedValue(null);

      // Act
      const result = await userService.getUserWithRoleByEmail(email);

      // Assert
      expect(result).toBeNull();
      expect(mockUser.findOne).toHaveBeenCalledWith({
        where: { email },
        raw: true
      });
      expect(mockRole.findOne).not.toHaveBeenCalled();
    });

    it('should call ensureConnected before querying', async () => {
      // Arrange
      const email = 'test@example.com';
      mockUser.findOne.mockResolvedValue(null);

      // Act
      await userService.getUserWithRoleByEmail(email);

      // Assert
      expect(mockSequelize.authenticate).toHaveBeenCalledTimes(1);
    });
  });

  describe('createUser', () => {
    it('should create user successfully when email does not exist', async () => {
      // Arrange
      const name = 'John';
      const surname = 'Doe';
      const email = 'newuser@example.com';
      const password = 'hashedPassword';
      const roleId = 1;
      
      const mockCreatedUser = {
        get: jest.fn().mockReturnValue({
          id: 1,
          name,
          surname,
          email,
          password,
          role: roleId
        })
      };

      // Mock getUserByEmail to return null (user doesn't exist)
      jest.spyOn(userService, 'getUserByEmail').mockResolvedValue(null);
      mockUser.create.mockResolvedValue(mockCreatedUser);
      mockRole.findOne.mockResolvedValue({ role_id: roleId, role_name: 'student' });

      // Act
      const result = await userService.createUser(name, surname, email, password, roleId);

      // Assert
      expect(userService.getUserByEmail).toHaveBeenCalledWith(email);
      expect(mockUser.create).toHaveBeenCalledWith({
        name,
        surname,
        email,
        password,
        role: roleId
      }, {
        returning: true
      });
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name', name);
      expect(result).toHaveProperty('surname', surname);
      expect(result).toHaveProperty('email', email);
      expect(result).toHaveProperty('role_name');
    });

    it('should throw error when user with email already exists', async () => {
      // Arrange
      const name = 'John';
      const surname = 'Doe';
      const email = 'existing@example.com';
      const password = 'hashedPassword';
      const roleId = 1;

      const existingUser = {
        id: 1,
        email: email,
        name: 'Existing',
        surname: 'User'
      };

      // Mock getUserByEmail to return existing user
      jest.spyOn(userService, 'getUserByEmail').mockResolvedValue(existingUser);

      // Act & Assert
      await expect(userService.createUser(name, surname, email, password, roleId))
        .rejects
        .toThrow('User with this email already exists');
      
      expect(userService.getUserByEmail).toHaveBeenCalledWith(email);
      expect(mockUser.create).not.toHaveBeenCalled();
    });

    it('should call ensureConnected before creating user', async () => {
      // Arrange
      const name = 'John';
      const surname = 'Doe';
      const email = 'test@example.com';
      const password = 'hashedPassword';
      const roleId = 1;

      jest.spyOn(userService, 'getUserByEmail').mockResolvedValue(null);
      const mockCreatedUser = {
        get: jest.fn().mockReturnValue({
          id: 1,
          name,
          surname,
          email,
          password,
          role: roleId
        })
      };
      mockUser.create.mockResolvedValue(mockCreatedUser);
      mockRole.findOne.mockResolvedValue({ role_id: roleId, role_name: 'student' });

      // Act
      await userService.createUser(name, surname, email, password, roleId);

      // Assert
      expect(mockSequelize.authenticate).toHaveBeenCalled();
    });

    it('should include role_name in returned user object', async () => {
      // Arrange
      const name = 'John';
      const surname = 'Doe';
      const email = 'test@example.com';
      const password = 'hashedPassword';
      const roleId = 2;
      const roleName = 'teacher';

      jest.spyOn(userService, 'getUserByEmail').mockResolvedValue(null);
      const mockCreatedUser = {
        get: jest.fn().mockReturnValue({
          id: 1,
          name,
          surname,
          email,
          password,
          role: roleId
        })
      };
      mockUser.create.mockResolvedValue(mockCreatedUser);
      mockRole.findOne.mockResolvedValue({ role_id: roleId, role_name: roleName });

      // Act
      const result = await userService.createUser(name, surname, email, password, roleId);

      // Assert
      expect(result.role_name).toBe(roleName);
      expect(mockRole.findOne).toHaveBeenCalledWith({
        where: { role_id: roleId },
        raw: true
      });
    });
  });
});

