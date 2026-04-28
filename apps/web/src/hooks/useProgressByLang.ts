import { useQuery } from "@tanstack/react-query";

export interface ProgressByLangItem {
  characterId: string;
  practiceLevel: number;
  nextReview: string;
  character: { label: string; romaji: string[] };
}

export interface ProgressByLangResponse {
  items: ProgressByLangItem[];
  totalCharacters: number;
}

async function fetchProgressByLang(lang: string): Promise<ProgressByLangResponse> {
  const res = await fetch(`/api/progress?lang=${encodeURIComponent(lang)}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch progress");
  return res.json() as Promise<ProgressByLangResponse>;
}

export function useProgressByLang(lang: string) {
  return useQuery({
    queryKey: ["progress", "lang", lang],
    queryFn: () => fetchProgressByLang(lang),
    staleTime: 5 * 60 * 1000,
  });
}

export interface LanguageSummary {
  id: string;
  code: string;
  name: string;
  script: string | null;
}

async function fetchLanguages(): Promise<LanguageSummary[]> {
  const res = await fetch("/api/languages", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch languages");
  return res.json() as Promise<LanguageSummary[]>;
}

export function useLanguages() {
  return useQuery({
    queryKey: ["languages"],
    queryFn: fetchLanguages,
    staleTime: 60 * 60 * 1000,
  });
}
