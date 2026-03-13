import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { db } from "@repo/database/client";

export const auth = betterAuth({
  appName: "Turbo Starter",

  database: prismaAdapter(db, {
    provider: "sqlite",
  }),

  trustedOrigins: [process.env.WEBAPP_URL!],

  advanced: {
    crossSubDomainCookies: {
      domain: process.env.COOKIE_DOMAIN!,
      enabled: true,
    },
  },

  secret: process.env.BETTER_AUTH_SECRET!,

  // methods
  emailAndPassword: {
    enabled: true,
  },
  // socialProviders: {},

  // extending
  user: {
    additionalFields: {
      stats: {
        type: "string",
        references: {
          model: "UserStats",
          field: "id",
        }
      }
    },
  },
});

export type Auth = typeof auth;
