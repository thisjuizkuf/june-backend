// medusa-config.js

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
    // Configure worker mode based on environment variable
    workerMode: (process.env.MEDUSA_WORKER_MODE || "shared") as "shared" | "worker" | "server",
    // Configure Redis URL for session storage
    redisUrl: process.env.REDIS_URL, // Used by Medusa for session management
  },
  // Admin configuration for disabling in worker mode
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
    // Add Redis Cache Module
    cache: {
      resolve: "@medusajs/medusa/cache-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
        ttl: 30, // Optional: time-to-live for cached items in seconds
      },
    },
    // Add Redis Event Bus Module
    eventBus: {
      resolve: "@medusajs/medusa/event-bus-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },
    // --- START: Correct Supabase File Storage Configuration (Medusa V2) ---
    file: { // This is the top-level File Module
      resolve: "@medusajs/medusa/file", // Resolves to the core file module
      options: {
        providers: [ // It takes an array of file storage providers
          {
            resolve: "@medusajs/medusa/file-s3", // This is the S3 compatible provider
            id: "supabase-storage", // A unique ID for this provider instance (can be 's3' or 'supabase-storage')
            options: {
              // --- Supabase Specific Options (as per Medusa V2 docs) ---
              // file_url: The public URL prefix for files.
              // For Supabase: https://{uniqueID}.supabase.co/storage/v1/object/public/{bucket}
              file_url: process.env.SUPABASE_FILE_URL,

              // access_key_id: For Supabase, this is your Project's anon (public) key.
              access_key_id: process.env.SUPABASE_ANON_KEY,

              // secret_access_key: For Supabase, this is your Project's service_role (secret) key.
              secret_access_key: process.env.SUPABASE_SERVICE_KEY,

              // region: Your Supabase project's region.
              region: process.env.SUPABASE_REGION,

              // bucket: The name of your Supabase Storage bucket (e.g., 'medusa-images').
              bucket: process.env.SUPABASE_BUCKET,

              // endpoint: The URL to the S3-compatible API endpoint.
              // For Supabase, this is the Endpoint URL from 'Storage Settings' (e.g., https://{uniqueID}.supabase.co/storage/v1)
              endpoint: process.env.SUPABASE_ENDPOINT,

              // additional_client_config: Crucial for Supabase's S3 compatibility.
              additional_client_config: {
                forcePathStyle: true, // This is explicitly required for Supabase
              },

              // Optional: Cache control for uploaded objects
              cache_control: process.env.S3_CACHE_CONTROL || 'public, max-age=31536000',
              // download_file_duration: Optional: Expiry time for presigned URLs in seconds
              // download_file_duration: 3600,
            },
          },
        ],
      },
    },
    // --- END: Correct Supabase File Storage Configuration ---
  },
})
