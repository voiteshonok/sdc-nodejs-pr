module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  collectCoverageFrom: [
    // Include core business logic
    'src/services/**/*.js',
    'src/utils/StudentValidator.js',
    'src/auth/Auth.controller.js',
    'src/auth/roles.js',
    // Exclude test files
    '!**/*.test.js',
    '!**/*.spec.js',
    // Exclude infrastructure utilities (filesystem operations, better for integration tests)
    '!src/utils/Logger.js',
    // Exclude Express-related code (covered by integration tests)
    '!index.js',
    '!src/auth/auth.middleware.js',
    '!src/auth/roleGuard.middleware.js',
    // Exclude config files
    '!config/**',
    // Exclude database-related files (covered by integration tests)
    '!models/**',
    '!migrations/**',
    '!seeders/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  verbose: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};

