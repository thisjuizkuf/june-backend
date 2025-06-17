import { loadEnv, defineConfig } from '@medusajs/framework/utils';

// Load environment variables based on the current NODE_ENV
loadEnv(process.env.NODE_ENV || 'development', process.cwd());

const ADMIN_CORS = process.env.ADMIN_CORS || "";
const STORE_CORS = process.env.STORE_CORS || "";
const AUTH_CORS = process.env.AUTH_CORS || "";
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const COOKIE_SECRET = process.env.COOKIE_SECRET || "supersecret";
const DATABASE_URL = process.env.DATABASE_URL || "postgres://localhost/medusa-db";
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

module.exports = defineConfig({
  projectConfig: {
    // Only basic HTTP configurations and secrets go here directly.
    http: {
      storeCors: STORE_CORS,
      adminCors: ADMIN_CORS,
      authCors: AUTH_CORS,
      jwtSecret: JWT_SECRET,
      cookieSecret: COOKIE_SECRET,
    }
  },
  modules: {
    // Core database module configuration
    database: {
      resolve: "@medusajs/medusa/database",
      options: {
        databaseUrl: DATABASE_URL,
        type: "postgres", // This is where databaseType goes
        driver: "mikro-orm", // This is where databaseDriver goes
        extra: process.env.NODE_ENV !== "development" ? { // This is where database_extra goes
          ssl: {
            rejectUnauthorized: false,
          },
        } : {},
      },
    },
    // Core event bus module configuration (often uses Redis)
    eventBus: {
      resolve: "@medusajs/medusa/event-bus-redis", // Use the Redis event bus
      options: {
        redisUrl: REDIS_URL, // Configure Redis URL here
      },
    },
    // Stock location module configuration (explicitly include if needed, as it was failing before)
    stockLocation: {
      resolve: "@medusajs/medusa/stock-location",
      options: {},
    },
  
   
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
  }
});
