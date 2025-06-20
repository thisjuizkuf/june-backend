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
    // **NEW**: Add a File Service Module for Production (e.g., S3)
    // If you're handling user-uploaded files (product images, etc.),
    // you need a production-ready file storage solution.
    // Replace this with your chosen provider (e.g., @medusajs/file-s3)
    file: {
      resolve: "@medusajs/medusa/file", // Core file module
      options: {
        providers: [
          {
            resolve: "@medusajs/file-s3", // Example: AWS S3 provider
            id: "s3",
            options: {
              access_key_id: process.env.S3_ACCESS_KEY_ID,
              secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
              bucket: process.env.S3_BUCKET_NAME,
              region: process.env.S3_REGION,
              // file_url: process.env.S3_URL, // Often derived from bucket/region, but can be set if custom endpoint
            },
          },
        ],
      },
    },

    // You might have other modules here (e.g., product, cart, order, shipping)
    // These are typically included by default in Medusa v2 boilerplate,
    // so you generally only need to explicitly add them if you want to override their default options
    // or use a custom resolver.
    // product: {
    //   resolve: "@medusajs/medusa/product",
    //   options: {}
    // },
    // cart: {
    //   resolve: "@medusajs/medusa/cart",
    //   options: {}
    // },
    // order: {
    //   resolve: "@medusajs/medusa/order",
    //   options: {}
    // },
    // inventory: {
    //   resolve: "@medusajs/medusa/inventory",
    //   options: {}
    // },
    // stockLocation: {
    //   resolve: "@medusajs/medusa/stock-location",
    //   options: {}
    // },
    // tax: {
    //   resolve: "@medusajs/medusa/tax",
    //   options: {}
    // },
    // shipping: {
    //   resolve: "@medusajs/medusa/shipping",
    //   options: {}
    // }
  },
})
