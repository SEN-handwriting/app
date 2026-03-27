import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { db } from "@repo/database/client";

export const auth = betterAuth({
  appName: "Sen",
  baseURL: process.env.BETTER_AUTH_URL!,

  database: prismaAdapter(db, {
    provider: "sqlite",
  }),

  trustedOrigins: [process.env.WEBAPP_URL!],

  advanced: {
    crossSubDomainCookies: {
      domain: process.env.COOKIE_DOMAIN ?? "",
      enabled: !!process.env.COOKIE_DOMAIN,
    },
  },

  secret: process.env.BETTER_AUTH_SECRET!,

  emailAndPassword: {
    enabled: true,
  },
});

export type Auth = typeof auth;
