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
  // ============================================================================
  // GRUNDLÄGGANDE KONFIGURATION
  // ============================================================================
  
  root: true, // Ange att detta är huvudkonfigurationen
  
  // ============================================================================
  // MILJÖINSTÄLLNINGAR
  // ============================================================================
  
  env: { 
    browser: true,    // Webbläsarmiljö
    es2020: true,     // ES2020 JavaScript-funktioner
    node: true,       // Node.js-miljö
    jest: true        // Jest testmiljö
  },
  
  // ============================================================================
  // UTÖKNINGAR OCH REGLER
  // ============================================================================
  
  extends: [
    'eslint:recommended',                    // Grundläggande ESLint-regler
    '@typescript-eslint/recommended',        // TypeScript-specifika regler
    'plugin:react-hooks/recommended',        // React Hooks-regler
    'plugin:jsx-a11y/recommended',          // Tillgänglighetsregler
    'plugin:testing-library/recommended',   // Testing Library-regler
    'prettier'                              // Prettier-integration
  ],
  
  // ============================================================================
  // FILTER OCH PARSER
  // ============================================================================
  
  ignorePatterns: [
    'dist',           // Byggmapp
    '.eslintrc.cjs',  // Denna konfigurationsfil
    'coverage'        // Testtäckningsrapporter
  ],
  
  parser: '@typescript-eslint/parser', // TypeScript-parser
  
  // ============================================================================
  // PLUGINS
  // ============================================================================
  
  plugins: [
    'react-refresh',        // React Fast Refresh
    'jsx-a11y',            // Tillgänglighet för JSX
    'testing-library',     // Testing Library-regler
    'prefer-arrow-functions' // Föredra arrow-funktioner
  ],
  
  // ============================================================================
  // REGLER OCH INSTÄLLNINGAR
  // ============================================================================
  
  rules: {
    // ========================================================================
    // REACT REFRESH REGLER
    // ========================================================================
    
    'react-refresh/only-export-components': [
      'warn', // Varning istället för fel
      { allowConstantExport: true }, // Tillåt konstantexport
    ],
    
    // ========================================================================
    // TYPESCRIPT REGLER
    // ========================================================================
    
    '@typescript-eslint/no-unused-vars': [
      'error', 
      { argsIgnorePattern: '^_' } // Ignorera oanvända parametrar som börjar med _
    ],
    '@typescript-eslint/no-explicit-any': 'warn', // Varning för 'any'-typer
    '@typescript-eslint/prefer-const': 'error',   // Föredra const över let
    '@typescript-eslint/no-var-requires': 'error', // Använd import istället för require
    
    // ========================================================================
    // JAVASCRIPT REGLER
    // ========================================================================
    
    'prefer-const': 'error',    // Föredra const över let
    'no-var': 'error',          // Använd inte var
    'no-console': 'warn',       // Varning för console.log (tillåt i utveckling)
    'no-debugger': 'error',     // Fel för debugger-satser
    
    // ========================================================================
    // FUNKTIONSSTIL REGLER
    // ========================================================================
    
    'prefer-arrow-functions/prefer-arrow-functions': 'warn', // Föredra arrow-funktioner
    
    // ========================================================================
    // TESTING LIBRARY REGLER
    // ========================================================================
    
    'testing-library/no-debugging-utils': 'warn',        // Varning för debugging-verktyg
    'testing-library/no-wait-for-side-effects': 'error', // Fel för sidoeffekter i waitFor
    
    // ========================================================================
    // TILLGÄNGLIGHET REGLER
    // ========================================================================
    
    'jsx-a11y/click-events-have-key-events': 'warn',     // Varning för klick utan tangentbord
    'jsx-a11y/no-static-element-interactions': 'warn'    // Varning för statiska element med interaktioner
  },
  
  // ============================================================================
  // REACT-INSTÄLLNINGAR
  // ============================================================================
  
  settings: {
    react: {
      version: 'detect' // Automatiskt upptäck React-version
    }
  }
};
