import { useQuery } from "@tanstack/react-query";

export interface ActivityDay {
  day: string;
  active: boolean;
}

export interface StatsData {
  progressCount: number;
  mastered: number;
  sessionCount: number;
  streak: number;
  activityDays: ActivityDay[];
}

async function fetchStats(): Promise<StatsData> {
  const res = await fetch("/api/stats", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json() as Promise<StatsData>;
}

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    staleTime: 5 * 60 * 1000,
  });
}
