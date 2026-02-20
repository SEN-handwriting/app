import { useQuery } from "@tanstack/react-query";
import type { Character } from "../data/characters";

async function fetchCharacters(lang?: string): Promise<Character[]> {
  const params = lang ? `?lang=${encodeURIComponent(lang)}` : "";
  const res = await fetch(`/api/characters${params}`);
  if (!res.ok) throw new Error("Failed to fetch characters");
  return res.json();
}

async function fetchCharacter(id: string): Promise<Character | null> {
  const res = await fetch(
    `/api/characters?id=${encodeURIComponent(id)}`,
  );
  if (!res.ok) throw new Error("Failed to fetch character");
  const data: Character[] = await res.json();
  return data[0] ?? null;
}

export function useCharacters(lang?: string) {
  return useQuery({
    queryKey: ["characters", lang ?? "all"],
    queryFn: () => fetchCharacters(lang),
    staleTime: 5 * 60 * 1000, // 5 min
  });
}

export function useCharacter(id: string) {
  return useQuery({
    queryKey: ["character", id],
    queryFn: () => fetchCharacter(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
