import { loadEnv, defineConfig } from '@medusajs/framework/utils'

// Load environment variables based on the current NODE_ENV
loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// Define REDIS_URL from environment variables
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    databaseType: "postgres", // Explicitly set databaseType
    databaseDriver: "mikro-orm", // Explicitly set databaseDriver (this is common for Medusa v2)
    redisUrl: REDIS_URL, // Use the REDIS_URL defined above
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
    // *** ADD THIS SECTION FOR SSL/TLS REQUIRED BY RENDER'S POSTGRES ***
    database_extra: process.env.NODE_ENV !== "development" ? {
      ssl: {
        rejectUnauthorized: false,
      },
    } : {},
    // ******************************************************************
  },
  // Add the modules configuration here
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
          // You can add other payment providers here if you have more, e.g.,
          // {
          //   resolve: "@medusajs/medusa/payment-paypal",
          //   id: "paypal",
          //   options: {
          //     // PayPal options
          //   }
          // }
        ],
      },
    },
    // You might have other modules here (e.g., product, cart, order, shipping)
    // For example:
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
    // // Add other core modules if they aren't explicitly defined and you need to configure them
    // // The default boilerplate usually includes these by default
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
  }
})
