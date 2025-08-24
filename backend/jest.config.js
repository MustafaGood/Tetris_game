/**
 * Jest-konfiguration för Tetris Backend
 * 
 * Denna fil konfigurerar Jest-testmiljön för backend-projektet
 * med kodtäckning, timeout-inställningar och testmappar.
 * 
 * @author Tetris Development Team
 * @version 1.0.0
 */

export default {
  testEnvironment: 'node',
  transform: {},
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  collectCoverageFrom: [
    '**/*.{js,ts}',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/*.config.js',
    '!**/test-*.js',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testMatch: [
    '**/__tests__/**/*.{js,ts}',
    '**/?(*.)+(spec|test).{js,ts}',
  ],
  testPathIgnorePatterns: [
    'performance.test.js',
    'api.test.js',
    'setup.js'
  ],
  testTimeout: 10000,
  verbose: true,
  forceExit: true,
};
