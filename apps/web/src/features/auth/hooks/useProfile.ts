import { authClient } from "@repo/auth/client";

export function useProfile() {
  return authClient.useSession();
}
