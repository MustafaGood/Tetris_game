// Environment configuration
export const config = {
  // API Configuration
  apiBase: import.meta.env.VITE_API_BASE || 
           (import.meta.env.DEV ? 'http://localhost:3001' : 'https://your-production-api.com'),
  
  // Environment flags
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // Feature flags
  enableServiceWorker: import.meta.env.PROD,
  enableHMR: import.meta.env.DEV,
  
  // Build info
  buildTime: import.meta.env.VITE_BUILD_TIME || new Date().toISOString(),
  version: import.meta.env.VITE_APP_VERSION || '1.0.0'
};

// Validate required environment variables
export function validateEnvironment() {
  if (!config.apiBase) {
    console.warn('VITE_API_BASE not set, using fallback URL');
  }
  
  if (config.isDevelopment) {
    console.log('🔧 Development mode enabled');
    console.log('🌐 API Base:', config.apiBase);
  } else {
    console.log('🚀 Production mode enabled');
    console.log('🌐 API Base:', config.apiBase);
  }
}

export default config;
