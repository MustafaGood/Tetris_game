/**
 * ESLint-konfiguration för Tetris Frontend
 * 
 * Denna fil konfigurerar kodkvalitetsregler och stilguide för frontend-projektet.
 * Använder TypeScript, React och moderna JavaScript-funktioner.
 * 
 * @author Tetris Development Team
 * @version 1.0.0
 */

module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    'no-console': 'warn',
    'no-debugger': 'error',
  },
  ignorePatterns: [
    'dist',
    'node_modules',
    'coverage',
    'src/**/*.ts',
    'src/**/*.tsx',
  ],
};
