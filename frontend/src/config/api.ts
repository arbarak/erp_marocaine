/**
 * API Configuration for ERP Marocaine
 * 
 * This module centralizes all API-related configuration including
 * base URLs, endpoints, and environment-specific settings.
 */

// Environment variables with fallbacks
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1'
const APP_ENV = import.meta.env.VITE_APP_ENV || 'development'

// Remove trailing slash from API URL
const normalizeUrl = (url: string): string => {
  return url.endsWith('/') ? url.slice(0, -1) : url
}

// API Configuration
export const apiConfig = {
  // Base URLs
  baseURL: normalizeUrl(API_URL),
  apiURL: `${normalizeUrl(API_URL)}/api`,
  
  // API Version
  version: API_VERSION,
  
  // Environment
  environment: APP_ENV,
  isDevelopment: APP_ENV === 'development',
  isProduction: APP_ENV === 'production',
  
  // Timeouts (in milliseconds)
  timeout: 30000, // 30 seconds
  retryDelay: 1000, // 1 second
  maxRetries: 3,
  
  // Headers
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Authentication
  auth: {
    tokenKey: 'access_token',
    refreshTokenKey: 'refresh_token',
    tokenPrefix: 'Bearer',
  },
} as const

// API Endpoints
export const apiEndpoints = {
  // Authentication
  auth: {
    login: '/auth/login/',
    refresh: '/auth/refresh/',
    verify: '/auth/verify/',
    logout: '/auth/logout/',
  },
  
  // Core modules
  accounts: '/accounts/',
  companies: '/companies/',
  
  // Business modules
  catalog: '/catalog/',
  inventory: '/inventory/',
  purchasing: '/purchasing/',
  sales: '/sales/',
  invoicing: '/invoicing/',
  accounting: '/accounting/',
  reporting: '/reporting/',
  
  // Health checks
  health: '/health/',
  readiness: '/readiness/',
  liveness: '/liveness/',
} as const

// Build full API URL
export const buildApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${apiConfig.apiURL}${cleanEndpoint}`
}

// Build full URL (for non-API endpoints)
export const buildUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${apiConfig.baseURL}${cleanPath}`
}

// Environment-specific configurations
export const environmentConfig = {
  development: {
    enableLogging: true,
    enableDevtools: true,
    enableMocks: false,
    logLevel: 'debug',
  },
  staging: {
    enableLogging: true,
    enableDevtools: false,
    enableMocks: false,
    logLevel: 'info',
  },
  production: {
    enableLogging: false,
    enableDevtools: false,
    enableMocks: false,
    logLevel: 'error',
  },
} as const

// Get current environment config
export const getCurrentEnvironmentConfig = () => {
  return environmentConfig[apiConfig.environment as keyof typeof environmentConfig] || environmentConfig.development
}

// Feature flags
export const featureFlags = {
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  enableDevtools: import.meta.env.VITE_ENABLE_DEVTOOLS === 'true',
} as const

// Export all configuration
export default {
  api: apiConfig,
  endpoints: apiEndpoints,
  environment: getCurrentEnvironmentConfig(),
  features: featureFlags,
  buildApiUrl,
  buildUrl,
}
