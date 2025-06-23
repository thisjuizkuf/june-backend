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
      jwtSecret: process.env.JWT_SECRET || "supersecret", // Change in production
      cookieSecret: process.env.COOKIE_SECRET || "supersecret", // Change in production
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

    // ✅ Supabase (S3-compatible) File Storage
    file: {
      resolve: "@medusajs/file-s3",
      options: {
        file_url: process.env.SUPABASE_FILE_URL,              // Public base URL
        access_key_id: process.env.SUPABASE_ANON_KEY,         // Supabase anon key
        secret_access_key: process.env.SUPABASE_SERVICE_KEY,  // Supabase service_role key
        region: process.env.SUPABASE_REGION,                  // Supabase region
        bucket: process.env.SUPABASE_BUCKET,                  // Bucket name (e.g. 'medusa-images')
        endpoint: process.env.SUPABASE_ENDPOINT,              // Supabase storage endpoint URL
        additional_client_config: {
          forcePathStyle: true,                               // Required for Supabase S3 API
        },
        cache_control: process.env.S3_CACHE_CONTROL || 'public, max-age=31536000',
      },
    },
  },
})
