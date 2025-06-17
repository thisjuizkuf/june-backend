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
    }
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
              // Your Stripe Secret API Key (starts with sk_).
              // It's crucial to load this from environment variables.
              apiKey: process.env.STRIPE_API_KEY,
              // Your Stripe Webhook Secret (starts with whsec_).
              // Also load this from environment variables, especially for production.
              webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
              // Set to true if you want payments to be captured automatically after successful authorization.
              // Set to false if you want to manually capture payments from the Medusa Admin.
              capture: true,
              // You can add other Stripe-specific options here if needed,
              // for example, to pass additional metadata or configuration to Stripe API calls.
              // For example:
              // enable_saved_cards: true,
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
