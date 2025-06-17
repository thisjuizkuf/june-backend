import { loadEnv, defineConfig } from '@medusajs/framework/utils';

// Load environment variables
loadEnv(process.env.NODE_ENV || 'development', process.cwd());

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_SECRET',
  'COOKIE_SECRET',
  'STRIPE_API_KEY'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar] && process.env.NODE_ENV === 'production') {
    throw new Error(`${envVar} is a required environment variable`);
  }
}

// Default CORS for development
const ADMIN_CORS = process.env.ADMIN_CORS || "http://localhost:7000,http://localhost:7001";
const STORE_CORS = process.env.STORE_CORS || "http://localhost:8000";
const AUTH_CORS = process.env.AUTH_CORS || "";

module.exports = defineConfig({
  projectConfig: {
    // Database configuration
    database_url: process.env.DATABASE_URL,
    database_type: "postgres",
    database_extra: process.env.NODE_ENV === "production" ? {
      ssl: {
        rejectUnauthorized: false
      }
    } : {},
    
    // Redis configuration
    redis_url: process.env.REDIS_URL,
    
    // HTTP server configuration
    http: {
      port: process.env.PORT || 8080,
      storeCors: STORE_CORS,
      adminCors: ADMIN_CORS,
      authCors: AUTH_CORS,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },

  modules: {
    // Core database module
    database: {
      resolve: "@medusajs/medusa/database",
      options: {
        databaseUrl: process.env.DATABASE_URL,
        type: "postgres",
        driver: "mikro-orm",
        extra: process.env.NODE_ENV === "production" ? {
          ssl: {
            rejectUnauthorized: false
          }
        } : {}
      }
    },

    // Event bus (Redis)
    eventBus: {
      resolve: "@medusajs/medusa/event-bus-redis",
      options: {
        redisUrl: process.env.REDIS_URL
      }
    },

    // Payment module (Stripe)
    payment: {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "@medusajs/payment-stripe",
            id: "stripe",
            options: {
              apiKey: process.env.STRIPE_API_KEY,
              webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
              capture: true
            }
          }
        ]
      }
    },

    // Essential core modules
    tax: {
      resolve: "@medusajs/medusa-tax",
      options: {}
    },
    stockLocation: {
      resolve: "@medusajs/medusa/stock-location",
      options: {}
    },
    inventory: {
      resolve: "@medusajs/medusa/inventory",
      options: {}
    },
    product: {
      resolve: "@medusajs/medusa/product",
      options: {}
    }
  }
});
