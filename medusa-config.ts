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
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
    workerMode: (process.env.MEDUSA_WORKER_MODE || "shared") as "shared" | "worker" | "server",
    redisUrl: process.env.REDIS_URL,
  },

  admin: {
    disable: process.env.DISABLE_MEDUSA_ADMIN === "true",
  },

  modules: {
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

    cache: {
      resolve: "@medusajs/medusa/cache-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
        ttl: 30,
      },
    },

    eventBus: {
      resolve: "@medusajs/medusa/event-bus-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },

    // ✅ Supabase S3-compatible Storage
    file: {
      resolve: "@medusajs/file-s3",
      options: {
        s3_url: process.env.S3_URL,                  // Supabase S3 endpoint
        region: process.env.S3_REGION || "us-west-1", // Not used by Supabase, but required
        bucket: process.env.S3_BUCKET,                // Bucket name in Supabase
        access_key_id: process.env.S3_ACCESS_KEY_ID,  // Dummy value if unused
        secret_access_key: process.env.S3_SECRET_ACCESS_KEY // Dummy value if unused
      },
    },
  },
})
