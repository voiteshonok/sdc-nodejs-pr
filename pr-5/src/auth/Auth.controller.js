const { UserService } = require('../services/UserService');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { ROLES } = require('./roles');

class AuthController {
  constructor(userService, jwtSecret) {
    this.userService = userService || new UserService();
    this.jwtSecret = jwtSecret || process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  }

  async login(email, password) {
    if (!email || !password) {
      return {
        success: false,
        code: 400,
        message: 'Email and password are required'
      };
    }

    try {
      const user = await this.userService.getUserWithRoleByEmail(email);

      if (!user) {
        return {
          success: false,
          code: 401,
          message: 'Invalid email or password'
        };
      }

      // Verify password
      const isPasswordValid = await this.userService.verifyPassword(password, user.password);

      if (!isPasswordValid) {
        return {
          success: false,
          code: 401,
          message: 'Invalid email or password'
        };
      }

      // Generate JWT token with user information
      const tokenPayload = {
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role_name: user.role_name
      };

      const token = jwt.sign(tokenPayload, this.jwtSecret, {
        expiresIn: '24h'
      });

      return {
        success: true,
        code: 200,
        message: 'Login successful',
        token: token,
        user: {
          id: user.id,
          name: user.name,
          surname: user.surname,
          email: user.email,
          role_name: user.role_name
        }
      };
    } catch (error) {
      return {
        success: false,
        code: 500,
        message: 'Internal server error',
        error: error.message
      };
    }
  }

  async register(email, password, name, surname, age, group) {
    if (!email || !password || !name || !surname || age === undefined || group === undefined) {
      return {
        success: false,
        code: 400,
        message: 'All fields are required: email, password, name, surname, age, group'
      };
    }

    try {
      // Check if user with email already exists
      const existingUser = await this.userService.getUserByEmail(email);
      if (existingUser) {
        return {
          success: false,
          code: 409,
          message: 'User with this email already exists'
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const studentRoleId = 1; // Student role is always role_id = 1

      // Create user with student role
      const newUser = await this.userService.createUser(
        name,
        surname,
        email,
        hashedPassword,
        studentRoleId
      );

      await this.userService.createStudent({
        name: `${name} ${surname}`,
        age: parseInt(age),
        group: parseInt(group)
      });

      return {
        success: true,
        code: 201,
        message: 'Registration successful',
        user: {
          id: newUser.id,
          name: newUser.name,
          surname: newUser.surname,
          email: newUser.email,
          role_name: newUser.role_name
        }
      };
    } catch (error) {
      return {
        success: false,
        code: 500,
        message: 'Registration failed',
        error: error.message
      };
    }
  }
}

module.exports = { AuthController };

