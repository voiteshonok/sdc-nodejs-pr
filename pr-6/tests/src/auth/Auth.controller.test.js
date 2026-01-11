const { AuthController } = require('../../../src/auth/Auth.controller');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('bcrypt');

describe('AuthController', () => {
  let authController;
  let mockUserService;
  const jwtSecret = 'test-secret-key';

  beforeEach(() => {
    // Mock UserService
    mockUserService = {
      getUserWithRoleByEmail: jest.fn(),
      getUserByEmail: jest.fn(),
      verifyPassword: jest.fn(),
      createUser: jest.fn(),
      createStudent: jest.fn(),
    };

    authController = new AuthController(mockUserService, jwtSecret);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return 400 when email is missing', async () => {
      // Arrange
      const email = '';
      const password = 'password123';

      // Act
      const result = await authController.login(email, password);

      // Assert
      expect(result.success).toBe(false);
      expect(result.code).toBe(400);
      expect(result.message).toBe('Email and password are required');
      expect(mockUserService.getUserWithRoleByEmail).not.toHaveBeenCalled();
    });

    it('should return 400 when password is missing', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = '';

      // Act
      const result = await authController.login(email, password);

      // Assert
      expect(result.success).toBe(false);
      expect(result.code).toBe(400);
      expect(result.message).toBe('Email and password are required');
      expect(mockUserService.getUserWithRoleByEmail).not.toHaveBeenCalled();
    });

    it('should return 401 when user does not exist', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      const password = 'password123';
      mockUserService.getUserWithRoleByEmail.mockResolvedValue(null);

      // Act
      const result = await authController.login(email, password);

      // Assert
      expect(result.success).toBe(false);
      expect(result.code).toBe(401);
      expect(result.message).toBe('Invalid email or password');
      expect(mockUserService.getUserWithRoleByEmail).toHaveBeenCalledWith(email);
      expect(mockUserService.verifyPassword).not.toHaveBeenCalled();
    });

    it('should return 401 when password is invalid', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'wrongPassword';
      const mockUser = {
        id: 1,
        name: 'John',
        surname: 'Doe',
        email: email,
        password: 'hashedPassword',
        role: 1,
        role_name: 'student'
      };

      mockUserService.getUserWithRoleByEmail.mockResolvedValue(mockUser);
      mockUserService.verifyPassword.mockResolvedValue(false);

      // Act
      const result = await authController.login(email, password);

      // Assert
      expect(result.success).toBe(false);
      expect(result.code).toBe(401);
      expect(result.message).toBe('Invalid email or password');
      expect(mockUserService.verifyPassword).toHaveBeenCalledWith(password, mockUser.password);
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should return 200 with token when login is successful', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const mockToken = 'jwt-token-here';
      const mockUser = {
        id: 1,
        name: 'John',
        surname: 'Doe',
        email: email,
        password: 'hashedPassword',
        role: 1,
        role_name: 'student'
      };

      mockUserService.getUserWithRoleByEmail.mockResolvedValue(mockUser);
      mockUserService.verifyPassword.mockResolvedValue(true);
      jwt.sign.mockReturnValue(mockToken);

      // Act
      const result = await authController.login(email, password);

      // Assert
      expect(result.success).toBe(true);
      expect(result.code).toBe(200);
      expect(result.message).toBe('Login successful');
      expect(result.token).toBe(mockToken);
      expect(result.user).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        surname: mockUser.surname,
        email: mockUser.email,
        role_name: mockUser.role_name
      });
      expect(mockUserService.verifyPassword).toHaveBeenCalledWith(password, mockUser.password);
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          id: mockUser.id,
          name: mockUser.name,
          surname: mockUser.surname,
          email: mockUser.email,
          role_name: mockUser.role_name
        },
        jwtSecret,
        { expiresIn: '24h' }
      );
    });

    it('should return 500 when database error occurs', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const errorMessage = 'Database connection failed';
      mockUserService.getUserWithRoleByEmail.mockRejectedValue(new Error(errorMessage));

      // Act
      const result = await authController.login(email, password);

      // Assert
      expect(result.success).toBe(false);
      expect(result.code).toBe(500);
      expect(result.message).toBe('Internal server error');
      expect(result.error).toBe(errorMessage);
    });
  });

  describe('register', () => {
    const validRegistrationData = {
      email: 'newuser@example.com',
      password: 'password123',
      name: 'John',
      surname: 'Doe',
      age: 20,
      group: 2
    };

    it('should return 400 when email is missing', async () => {
      // Arrange
      const data = { ...validRegistrationData, email: '' };

      // Act
      const result = await authController.register(
        data.email,
        data.password,
        data.name,
        data.surname,
        data.age,
        data.group
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.code).toBe(400);
      expect(result.message).toContain('All fields are required');
      expect(mockUserService.getUserByEmail).not.toHaveBeenCalled();
    });

    it('should return 400 when password is missing', async () => {
      // Arrange
      const data = { ...validRegistrationData, password: '' };

      // Act
      const result = await authController.register(
        data.email,
        data.password,
        data.name,
        data.surname,
        data.age,
        data.group
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.code).toBe(400);
      expect(result.message).toContain('All fields are required');
    });

    it('should return 400 when name is missing', async () => {
      // Arrange
      const data = { ...validRegistrationData, name: '' };

      // Act
      const result = await authController.register(
        data.email,
        data.password,
        data.name,
        data.surname,
        data.age,
        data.group
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.code).toBe(400);
      expect(result.message).toContain('All fields are required');
    });

    it('should return 400 when age is undefined', async () => {
      // Arrange
      const data = { ...validRegistrationData, age: undefined };

      // Act
      const result = await authController.register(
        data.email,
        data.password,
        data.name,
        data.surname,
        data.age,
        data.group
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.code).toBe(400);
      expect(result.message).toContain('All fields are required');
    });

    it('should return 409 when user with email already exists', async () => {
      // Arrange
      const existingUser = {
        id: 1,
        email: validRegistrationData.email,
        name: 'Existing',
        surname: 'User'
      };

      mockUserService.getUserByEmail.mockResolvedValue(existingUser);

      // Act
      const result = await authController.register(
        validRegistrationData.email,
        validRegistrationData.password,
        validRegistrationData.name,
        validRegistrationData.surname,
        validRegistrationData.age,
        validRegistrationData.group
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.code).toBe(409);
      expect(result.message).toBe('User with this email already exists');
      expect(mockUserService.getUserByEmail).toHaveBeenCalledWith(validRegistrationData.email);
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockUserService.createUser).not.toHaveBeenCalled();
    });

    it('should successfully register new user', async () => {
      // Arrange
      const hashedPassword = 'hashedPassword123';
      const mockCreatedUser = {
        id: 1,
        name: validRegistrationData.name,
        surname: validRegistrationData.surname,
        email: validRegistrationData.email,
        role: 1,
        role_name: 'student'
      };

      mockUserService.getUserByEmail.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue(hashedPassword);
      mockUserService.createUser.mockResolvedValue(mockCreatedUser);
      mockUserService.createStudent.mockResolvedValue({});

      // Act
      const result = await authController.register(
        validRegistrationData.email,
        validRegistrationData.password,
        validRegistrationData.name,
        validRegistrationData.surname,
        validRegistrationData.age,
        validRegistrationData.group
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.code).toBe(201);
      expect(result.message).toBe('Registration successful');
      expect(result.user).toEqual({
        id: mockCreatedUser.id,
        name: mockCreatedUser.name,
        surname: mockCreatedUser.surname,
        email: mockCreatedUser.email,
        role_name: mockCreatedUser.role_name
      });
      expect(mockUserService.getUserByEmail).toHaveBeenCalledWith(validRegistrationData.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(validRegistrationData.password, 10);
      expect(mockUserService.createUser).toHaveBeenCalledWith(
        validRegistrationData.name,
        validRegistrationData.surname,
        validRegistrationData.email,
        hashedPassword,
        1 // student role ID
      );
      expect(mockUserService.createStudent).toHaveBeenCalledWith({
        name: `${validRegistrationData.name} ${validRegistrationData.surname}`,
        age: validRegistrationData.age,
        group: validRegistrationData.group
      });
    });

    it('should hash password before creating user', async () => {
      // Arrange
      const hashedPassword = 'hashedPassword123';
      const mockCreatedUser = {
        id: 1,
        name: validRegistrationData.name,
        surname: validRegistrationData.surname,
        email: validRegistrationData.email,
        role: 1,
        role_name: 'student'
      };

      mockUserService.getUserByEmail.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue(hashedPassword);
      mockUserService.createUser.mockResolvedValue(mockCreatedUser);
      mockUserService.createStudent.mockResolvedValue({});

      // Act
      await authController.register(
        validRegistrationData.email,
        validRegistrationData.password,
        validRegistrationData.name,
        validRegistrationData.surname,
        validRegistrationData.age,
        validRegistrationData.group
      );

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith(validRegistrationData.password, 10);
      expect(mockUserService.createUser).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(String),
        hashedPassword, // hashed password, not plain
        expect.any(Number)
      );
    });

    it('should create student record with combined name', async () => {
      // Arrange
      const hashedPassword = 'hashedPassword123';
      const mockCreatedUser = {
        id: 1,
        name: validRegistrationData.name,
        surname: validRegistrationData.surname,
        email: validRegistrationData.email,
        role: 1,
        role_name: 'student'
      };

      mockUserService.getUserByEmail.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue(hashedPassword);
      mockUserService.createUser.mockResolvedValue(mockCreatedUser);
      mockUserService.createStudent.mockResolvedValue({});

      // Act
      await authController.register(
        validRegistrationData.email,
        validRegistrationData.password,
        validRegistrationData.name,
        validRegistrationData.surname,
        validRegistrationData.age,
        validRegistrationData.group
      );

      // Assert
      expect(mockUserService.createStudent).toHaveBeenCalledWith({
        name: `${validRegistrationData.name} ${validRegistrationData.surname}`,
        age: validRegistrationData.age,
        group: validRegistrationData.group
      });
    });

    it('should return 500 when database error occurs', async () => {
      // Arrange
      const errorMessage = 'Database connection failed';
      mockUserService.getUserByEmail.mockRejectedValue(new Error(errorMessage));

      // Act
      const result = await authController.register(
        validRegistrationData.email,
        validRegistrationData.password,
        validRegistrationData.name,
        validRegistrationData.surname,
        validRegistrationData.age,
        validRegistrationData.group
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.code).toBe(500);
      expect(result.message).toBe('Registration failed');
      expect(result.error).toBe(errorMessage);
    });

    it('should create user with student role (role_id = 1)', async () => {
      // Arrange
      const hashedPassword = 'hashedPassword123';
      const mockCreatedUser = {
        id: 1,
        name: validRegistrationData.name,
        surname: validRegistrationData.surname,
        email: validRegistrationData.email,
        role: 1,
        role_name: 'student'
      };

      mockUserService.getUserByEmail.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue(hashedPassword);
      mockUserService.createUser.mockResolvedValue(mockCreatedUser);
      mockUserService.createStudent.mockResolvedValue({});

      // Act
      await authController.register(
        validRegistrationData.email,
        validRegistrationData.password,
        validRegistrationData.name,
        validRegistrationData.surname,
        validRegistrationData.age,
        validRegistrationData.group
      );

      // Assert
      expect(mockUserService.createUser).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(String),
        expect.any(String),
        1 // student role ID
      );
    });

    it('should convert age and group to integers', async () => {
      // Arrange
      const hashedPassword = 'hashedPassword123';
      const mockCreatedUser = {
        id: 1,
        name: validRegistrationData.name,
        surname: validRegistrationData.surname,
        email: validRegistrationData.email,
        role: 1,
        role_name: 'student'
      };

      mockUserService.getUserByEmail.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue(hashedPassword);
      mockUserService.createUser.mockResolvedValue(mockCreatedUser);
      mockUserService.createStudent.mockResolvedValue({});

      // Act
      await authController.register(
        validRegistrationData.email,
        validRegistrationData.password,
        validRegistrationData.name,
        validRegistrationData.surname,
        '20', // string age
        '2'   // string group
      );

      // Assert
      expect(mockUserService.createStudent).toHaveBeenCalledWith({
        name: expect.any(String),
        age: 20, // converted to integer
        group: 2 // converted to integer
      });
    });
  });
});

