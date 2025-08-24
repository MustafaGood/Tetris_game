# Environment Setup Guide

This guide explains how to configure environment variables for the Tetris frontend application.

## Environment Variables

### Required Variables

- `VITE_API_BASE`: The base URL for your API server
  - Development: `http://localhost:3001`
  - Production: `https://your-production-api.com`

### Optional Variables

- `VITE_APP_VERSION`: Application version (defaults to '1.0.0')
- `VITE_BUILD_TIME`: Build timestamp (auto-generated if not set)

## Setup Instructions

### 1. Create Environment File

Create a `.env.local` file in the frontend directory:

```bash
# Development
VITE_API_BASE=http://localhost:3001

# Production (example)
# VITE_API_BASE=https://your-production-api.com
```

### 2. Environment File Priority

Vite loads environment files in this order (highest priority first):
1. `.env.local` (gitignored, local overrides)
2. `.env.development` (development mode)
3. `.env.production` (production mode)
4. `.env` (default)

### 3. Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Troubleshooting

### Console Errors

- **Vite HMR connection failed**: This is normal in production builds
- **Service Worker registration failed**: Service Worker only registers in production
- **API connection failed**: Check your `VITE_API_BASE` value

### Development vs Production

- **Development**: Service Worker disabled, HMR enabled
- **Production**: Service Worker enabled, HMR disabled

## Security Notes

- Only variables prefixed with `VITE_` are exposed to the client
- Never expose sensitive information like API keys
- Use server-side environment variables for sensitive data
