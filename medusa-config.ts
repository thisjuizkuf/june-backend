// medusa-config.js

import { loadEnv, defineConfig } from '@medusajs/framework/utils'
import { User } from '@medusajs/medusa/dist/models/user' // Import Medusa's User model
import { hash } from 'bcryptjs' // Import bcryptjs for password hashing (though userService should handle it)
import { get } from 'lodash'; // Required for migrationRouter.get.getMigrationsToRun()


loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// Helper function to run migrations
async function runMigrations({ container, logger }) {
  try {
    const medusaContainer = container;
    const migrationRouter = medusaContainer.resolve("migrationRouter")
    const migrationsToRun = await migrationRouter.getMigrationsToRun() // Corrected to just .getMigrationsToRun()

    if (migrationsToRun.length > 0) {
      logger.info(`[Migrations] Running ${migrationsToRun.length} pending migrations...`);
      await migrationRouter.runMigrations();
      logger.info(`[Migrations] All migrations ran successfully.`);
    } else {
      logger.info(`[Migrations] No pending migrations to run.`);
    }
  } catch (error) {
    logger.error(`[Migrations] Error running migrations: ${error.message}`);
    logger.error(error);
    process.exit(1); // Exit if migrations fail, as it's critical
  }
}


module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    databaseDriverOptions: process.env.NODE_ENV === "production" ? { connection: { ssl: { rejectUnauthorized: false } } } : {},
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
  },
  // This is the onBootup hook for Medusa v2 - THIS IS CRITICAL
  onBootup: async ({ container, logger }) => {
    // First, run migrations
    await runMigrations({ container, logger });

    // Then, create the admin user
    try {
      const userService = container.resolve('userService');

      const adminEmail = process.env.ADMIN_EMAIL || "info@exoticpetheven.com";
      const adminPassword = process.env.ADMIN_PASSWORD || "exoticpetheven!";

      logger.info(`[Admin Bootup] Checking for admin user: ${adminEmail}`);

      const existingUser = await userService.retrieveByEmail(adminEmail).catch(() => undefined);

      if (!existingUser) {
        logger.info(`[Admin Bootup] Admin user not found. Creating user: ${adminEmail}`);
        await userService.create({
          email: adminEmail,
          password: adminPassword, // Pass plain password, userService hashes it
          role: "admin",
        });
        logger.info(`[Admin Bootup] Admin user ${adminEmail} created successfully on server startup.`);
      } else {
        logger.info(`[Admin Bootup] Admin user ${adminEmail} already exists. Skipping creation.`);
      }
    } catch (error) {
      logger.error(`[Admin Bootup] Error creating admin user on startup: ${error.message}`);
      logger.error(error);
      process.exit(1);
    }
  },
})
