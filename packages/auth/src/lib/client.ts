import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { Auth } from "./server";

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<Auth>()],
});

export type Session = typeof authClient.$Infer.Session;
