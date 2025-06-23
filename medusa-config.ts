import { loadEnv, defineConfig } from '@medusajs/framework/utils'

// Load environment variables based on the current NODE_ENV
loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",     // IMPORTANT: Change in production
      cookieSecret: process.env.COOKIE_SECRET || "supersecret", // IMPORTANT: Change in production
    },
    workerMode: (process.env.MEDUSA_WORKER_MODE || "shared") as "shared" | "worker" | "server",
    redisUrl: process.env.REDIS_URL,
  },

  admin: {
    disable: process.env.DISABLE_MEDUSA_ADMIN === "true",
  },

  modules: {
    // Stripe Payment
    payment: {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "@medusajs/payment-stripe",
            id: "stripe",
            options: {
              apiKey: process.env.STRIPE_API_KEY,
              webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
              capture: true,
            },
          },
        ],
      },
    },

    // Redis Caching
    cache: {
      resolve: "@medusajs/medusa/cache-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
        ttl: 30,
      },
    },

    // Redis Event Bus
    eventBus: {
      resolve: "@medusajs/medusa/event-bus-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },

    // Supabase via S3-compatible storage
    file: {
      resolve: "@medusajs/file-s3", // ✅ Use the correct package name
      options: {
        endpoint: process.env.S3_URL,                     // Supabase S3 endpoint
        region: process.env.S3_REGION || "us-west-1",     // Can be anything, not used
        bucket: process.env.S3_BUCKET,                    // Your Supabase bucket name
        accessKeyId: process.env.S3_ACCESS_KEY_ID,        // Dummy or required (not used)
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY // Dummy or required (not used)
      },
    },
  },
})
