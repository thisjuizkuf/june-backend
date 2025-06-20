import { loadEnv, defineConfig } from '@medusajs/framework/utils'

// Load environment variables based on the current NODE_ENV
loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    // Add database driver options for production SSL connections if needed (e.g., for external PostgreSQL)
    // databaseDriverOptions: process.env.NODE_ENV !== "development" ? { connection: { ssl: { rejectUnauthorized: false } } } : {},
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret", // **IMPORTANT**: Change default for production
      cookieSecret: process.env.COOKIE_SECRET || "supersecret", // **IMPORTANT**: Change default for production
    },
    // **NEW**: Configure worker mode based on environment variable
    workerMode: (process.env.MEDUSA_WORKER_MODE || "shared") as "shared" | "worker" | "server",
    // **NEW**: Configure Redis URL for session storage
    redisUrl: process.env.REDIS_URL, // Used by Medusa for session management
  },
  // **NEW**: Admin configuration for disabling in worker mode
  admin: {
    disable: process.env.DISABLE_MEDUSA_ADMIN === "true",
  },
  modules: {
    // This is the core payment module for Medusa v2
    payment: {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "@medusajs/payment-stripe", // The Stripe payment plugin you've installed
            id: "stripe", // A unique ID for this payment provider
            options: {
              apiKey: process.env.STRIPE_API_KEY,
              webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
              capture: true,
            },
          },
        ],
      },
    },
    // **NEW**: Add Redis Cache Module
    cache: {
      resolve: "@medusajs/medusa/cache-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
        ttl: 30, // Optional: time-to-live for cached items in seconds
      },
    },
    // **NEW**: Add Redis Event Bus Module
    eventBus: {
      resolve: "@medusajs/medusa/event-bus-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },
    
    // }
  },
})
