import { useQuery } from "@tanstack/react-query";
import type { SessionsResponse } from "../app/api/sessions/route";

async function fetchSessions(limit: number): Promise<SessionsResponse> {
  const res = await fetch(`/api/sessions?limit=${limit}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch sessions");
  return res.json() as Promise<SessionsResponse>;
}

export function useRecentSessions(limit = 10) {
  return useQuery({
    queryKey: ["sessions", limit],
    queryFn: () => fetchSessions(limit),
    staleTime: 5 * 60 * 1000,
  });
}
