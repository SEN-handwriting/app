import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { Auth } from "./server";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000",
  plugins: [inferAdditionalFields<Auth>()],
});

export type Session = typeof authClient.$Infer.Session;
