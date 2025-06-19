import { loadEnv, defineConfig } from '@medusajs/framework/utils'

// Load environment variables
loadEnv(process.env.NODE_ENV || 'production', process.cwd())

export default defineConfig({
  projectConfig: {
    // Database configuration
    databaseUrl: process.env.DATABASE_URL,
    database_type: "postgres",
    redisUrl: process.env.REDIS_URL,

    // HTTP Server Configuration
    http: {
      // Storefront CORS (your live store + local development)
      storeCors: [
        "https://exoticpetheven.com",
        "https://www.exoticpetheven.com",
        "http://localhost:8000"
      ].join(","),
      
      // Admin CORS (dedicated subdomain recommended)
      adminCors: [
        "https://admin.exoticpetheven.com",
        "https://backend-9byh.onrender.com",
        "http://localhost:7001"
      ].join(","),
      
      // Auth CORS
      authCors: [
        "https://exoticpetheven.com",
        "https://admin.exoticpetheven.com"
      ].join(","),

      // Security - MUST be set via environment variables
      jwtSecret: process.env.JWT_SECRET,  // Generate via: openssl rand -hex 32
      cookieSecret: process.env.COOKIE_SECRET,  // Generate via: openssl rand -hex 32
      
      // Disable localhost warning in production
      adminApiDisabled: false
    },

    // Uncomment if using file uploads
    // file_service: "s3",
    // file_service_config: {
    //   s3: {
    //     bucket: process.env.S3_BUCKET,
    //     region: process.env.S3_REGION,
    //     access_key_id: process.env.S3_ACCESS_KEY_ID,
    //     secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
    //     endpoint: process.env.S3_ENDPOINT || undefined
    //   }
    // }
  },

  // Admin Dashboard Configuration
  admin: {
    disable: false,
    // Uncomment to customize admin path (not recommended)
    // path: "/dashboard"
  },

  // Plugin Configuration
  plugins: [
    {
      resolve: "@medusajs/admin-ui",
      options: {
        serve: true,
        path: "/admin"
      }
    }
  ],

  // Modules Configuration
  modules: {
    // API Key Module
    api_key: {
      resolve: "@medusajs/api-key",
      options: {
        publishableKeys: {
          enabled: process.env.REQUIRE_API_KEYS === "true"
        }
      }
    },

    // Payment Module
    payment: {
      resolve: "@medusajs/medusa-payment",
      options: {
        providers: [
          {
            resolve: "@medusajs/payment-stripe",
            options: {
              api_key: process.env.STRIPE_API_KEY,
              webhook_secret: process.env.STRIPE_WEBHOOK_SECRET
            }
          }
        ]
      }
    },

    // Cache Module (recommended for production)
    cacheService: {
      resolve: "@medusajs/cache-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
        ttl: 3600 // 1 hour cache
      }
    }
  },

  // Feature Flags
  featureFlags: {
    product_categories: true,
    sales_channels: true
  }
})
