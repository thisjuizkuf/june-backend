import { loadEnv, defineConfig } from '@medusajs/framework/utils';

// Load environment variables
loadEnv(process.env.NODE_ENV || 'development', process.cwd());

// Environment variables with better defaults
const ADMIN_CORS = process.env.ADMIN_CORS || "http://localhost:7000,http://localhost:7001";
const STORE_CORS = process.env.STORE_CORS || "http://localhost:8000";
const AUTH_CORS = process.env.AUTH_CORS || "";
const JWT_SECRET = process.env.JWT_SECRET || throwError("JWT_SECRET is required");
const COOKIE_SECRET = process.env.COOKIE_SECRET || throwError("COOKIE_SECRET is required");
const DATABASE_URL = process.env.DATABASE_URL || throwError("DATABASE_URL is required");
const REDIS_URL = process.env.REDIS_URL || throwError("REDIS_URL is required");

// Helper function for required env vars
function throwError(message) {
  throw new Error(message);
}

module.exports = defineConfig({
  projectConfig: {
    http: {
      port: process.env.PORT || 8080, // Crucial for Render
      storeCors: STORE_CORS,
      adminCors: ADMIN_CORS,
      authCors: AUTH_CORS,
      jwtSecret: JWT_SECRET,
      cookieSecret: COOKIE_SECRET,
    },
    database: {
      type: "postgres",
      url: DATABASE_URL,
      extra: {
        ssl: process.env.NODE_ENV === "production" ? {
          rejectUnauthorized: false,
          ca: process.env.DB_SSL_CA?.replace(/\\n/g, '\n'),
          key: process.env.DB_SSL_KEY?.replace(/\\n/g, '\n'),
          cert: process.env.DB_SSL_CERT?.replace(/\\n/g, '\n')
        } : undefined
      }
    },
    redis_url: REDIS_URL // Critical addition for Redis
  },
  modules: {
    database: {
      resolve: "@medusajs/medusa/database",
      options: {
        databaseUrl: DATABASE_URL,
        type: "postgres",
        driver: "mikro-orm",
        extra: process.env.NODE_ENV !== "development" ? {
          ssl: {
            rejectUnauthorized: false
          }
        } : {}
      }
    },
    eventBus: {
      resolve: "@medusajs/medusa/event-bus-redis",
      options: {
        redisUrl: REDIS_URL
      }
    },
    stockLocation: {
      resolve: "@medusajs/medusa/stock-location",
      options: {}
    },
    tax: {  // Added tax module to resolve your errors
      resolve: "@medusajs/medusa-tax",
      options: {}
    },
    payment: {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "@medusajs/payment-stripe",
            id: "stripe",
            options: {
              apiKey: process.env.STRIPE_API_KEY || throwError("STRIPE_API_KEY required"),
              webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
              capture: true
            }
          }
        ]
      }
    }
  }
});
