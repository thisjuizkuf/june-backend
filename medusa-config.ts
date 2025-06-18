import { loadEnv, defineConfig } from '@medusajs/framework/utils'

// Load environment variables based on the current NODE_ENV
loadEnv(process.env.NODE_ENV || 'development', process.cwd())

export default defineConfig({
  projectConfig: {
    // Database URL for PostgreSQL
    databaseUrl: process.env.DATABASE_URL,
    // Redis URL for session management and queues
    redisUrl: process.env.REDIS_URL,
    http: {
      // CORS settings for the storefront API
      storeCors: process.env.STORE_CORS!,
      // CORS settings for the admin API
      adminCors: process.env.ADMIN_CORS!,
      // CORS settings for authentication routes
      authCors: process.env.AUTH_CORS!,
      // Secret for JWT token generation
      jwtSecret: process.env.JWT_SECRET || "supersecret", // REMEMBER TO USE A STRONG, RANDOM SECRET IN PRODUCTION
      // Secret for cookie encryption
      cookieSecret: process.env.COOKIE_SECRET || "supersecret", // REMEMBER TO USE A STRONG, RANDOM SECRET IN PRODUCTION
    }
  },
  // Modules configuration
  modules: {
    // Core payment module for Medusa v2
    payment: {
      resolve: "@medusajs/medusa/payment",
      options: {
        // Payment providers configuration
        providers: [
          {
            resolve: "@medusajs/payment-stripe", // The Stripe payment plugin
            id: "stripe", // Unique ID for this payment provider
            options: {
              apiKey: process.env.STRIPE_API_KEY, // Stripe API Key from environment variables
              webhookSecret: process.env.STRIPE_WEBHOOK_SECRET, // Stripe Webhook Secret from environment variables
              capture: true, // Whether to capture payments immediately
            },
          },
        ],
      },
    },
    // Add other modules here as needed (e.g., notification, fulfillment, tax)
  }
})
