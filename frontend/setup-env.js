#!/usr/bin/env node

/**
 * Environment Setup Script
 * Creates a .env.local file with the necessary environment variables
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env.local');
const envExamplePath = path.join(__dirname, 'env.example');

console.log('🔧 Setting up environment variables...');

// Check if .env.local already exists
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists. Skipping setup.');
  process.exit(0);
}

// Read env.example if it exists
let envContent = '';
if (fs.existsSync(envExamplePath)) {
  envContent = fs.readFileSync(envExamplePath, 'utf8');
} else {
  // Default environment content
  envContent = `# API Configuration
VITE_API_BASE=http://localhost:3001

# Environment
NODE_ENV=development

# Optional: Application version
# VITE_APP_VERSION=2.0.0

# Optional: Build timestamp (auto-generated if not set)
# VITE_BUILD_TIME=${new Date().toISOString()}
`;
}

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file successfully!');
  console.log('📝 Please review and modify the values as needed.');
  console.log('🔍 File location:', envPath);
} catch (error) {
  console.error('❌ Failed to create .env.local file:', error.message);
  process.exit(1);
}

console.log('\n📚 Next steps:');
console.log('1. Review the .env.local file');
console.log('2. Update VITE_API_BASE to match your backend URL');
console.log('3. Run "npm run dev" to start development server');
console.log('\n📖 See ENVIRONMENT_SETUP.md for more details');
