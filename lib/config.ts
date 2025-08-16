// Application configuration with type safety and validation

export const config = {
  // API Configuration
  googleAiApiKey: process.env.GOOGLE_AI_API_KEY || '',

  // Application URLs
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'AI Social Caption Assistant',

  // Feature Flags
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  enableErrorReporting: process.env.NEXT_PUBLIC_ENABLE_ERROR_REPORTING === 'true',

  // Rate Limiting
  apiRateLimitMax: parseInt(process.env.API_RATE_LIMIT_MAX || '100', 10),
  apiRateLimitWindow: parseInt(process.env.API_RATE_LIMIT_WINDOW || '900000', 10), // 15 minutes

  // File Upload Configuration
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
  allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp')
    .split(',')
    .map(type => type.trim()),

  // AI Configuration
  aiMaxTokens: parseInt(process.env.AI_MAX_TOKENS || '1000', 10),
  aiTemperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
  aiTopP: parseFloat(process.env.AI_TOP_P || '0.9'),

  // Social Media API Configuration
  instagram: {
    clientId: process.env.INSTAGRAM_CLIENT_ID || '',
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || '',
    redirectUri: process.env.INSTAGRAM_REDIRECT_URI || '',
  },
  facebook: {
    appId: process.env.FACEBOOK_APP_ID || '',
    appSecret: process.env.FACEBOOK_APP_SECRET || '',
    redirectUri: process.env.FACEBOOK_REDIRECT_URI || '',
  },

  // Environment
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTesting: process.env.NODE_ENV === 'test',
} as const

// Validation function to ensure required config is present
export function validateConfig(): void {
  const requiredKeys = ['googleAiApiKey'] as const

  for (const key of requiredKeys) {
    if (!config[key]) {
      throw new Error(`Missing required environment variable: ${key}`)
    }
  }

  // Validate file size limits
  if (config.maxFileSize <= 0) {
    throw new Error('MAX_FILE_SIZE must be a positive number')
  }

  // Validate AI parameters
  if (config.aiTemperature < 0 || config.aiTemperature > 2) {
    throw new Error('AI_TEMPERATURE must be between 0 and 2')
  }

  if (config.aiTopP < 0 || config.aiTopP > 1) {
    throw new Error('AI_TOP_P must be between 0 and 1')
  }
}

// Helper function to get public config (safe for client-side)
export function getPublicConfig() {
  return {
    appUrl: config.appUrl,
    appName: config.appName,
    enableAnalytics: config.enableAnalytics,
    enableErrorReporting: config.enableErrorReporting,
    maxFileSize: config.maxFileSize,
    allowedFileTypes: config.allowedFileTypes,
    isDevelopment: config.isDevelopment,
    isProduction: config.isProduction,
    instagram: {
      clientId: config.instagram.clientId,
    },
    facebook: {
      appId: config.facebook.appId,
    },
  }
}