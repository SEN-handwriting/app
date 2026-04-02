import { cache } from "react";
import { auth } from "@repo/auth/server";
import { headers } from "next/headers";

/**
 * Cached session getter — deduplicates auth DB lookups within a single request.
 * Uses React.cache() so multiple server components calling this in the same
 * render tree share one result instead of hitting the DB N times.
 */
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});
