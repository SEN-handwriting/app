import { useQuery } from "@tanstack/react-query";
import type { RevisionResponse } from "../app/api/revision/route";

async function fetchRevisionQueue(lang?: string): Promise<RevisionResponse> {
  const url = lang
    ? `/api/revision?lang=${encodeURIComponent(lang)}`
    : "/api/revision";
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch revision queue");
  return res.json() as Promise<RevisionResponse>;
}

export function useRevisionQueue(lang?: string) {
  return useQuery({
    queryKey: ["revision", lang ?? "all"],
    queryFn: () => fetchRevisionQueue(lang),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRevisionCount(lang?: string) {
  return useQuery({
    queryKey: ["revision", lang ?? "all"],
    queryFn: () => fetchRevisionQueue(lang),
    select: (data) => data.total,
    staleTime: 5 * 60 * 1000,
  });
}
