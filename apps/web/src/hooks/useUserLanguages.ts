import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserLanguagesResponse } from "../app/api/user/languages/route";

async function fetchUserLanguages(): Promise<UserLanguagesResponse> {
  const res = await fetch("/api/user/languages", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch user languages");
  return res.json() as Promise<UserLanguagesResponse>;
}

export function useUserLanguages() {
  const queryClient = useQueryClient();
  const QUERY_KEY = ["user-languages"];

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchUserLanguages,
    staleTime: 5 * 60 * 1000,
  });

  const addLanguage = useMutation({
    mutationFn: async (languageId: string) => {
      const res = await fetch(`/api/user/languages/${languageId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active" }),
      });
      if (!res.ok) throw new Error("Failed to add language");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const removeLanguage = useMutation({
    mutationFn: async (languageId: string) => {
      const res = await fetch(`/api/user/languages/${languageId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "inactive" }),
      });
      if (!res.ok) throw new Error("Failed to remove language");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const saveOnboarding = useMutation({
    mutationFn: async (languageIds: string[]) => {
      const res = await fetch("/api/user/languages", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ languageIds }),
      });
      if (!res.ok) throw new Error("Failed to save language preferences");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  return {
    active: query.data?.active ?? [],
    others: query.data?.others ?? [],
    isLoading: query.isLoading,
    addLanguage: addLanguage.mutate,
    removeLanguage: removeLanguage.mutate,
    saveOnboarding: saveOnboarding.mutateAsync,
    isSaving: saveOnboarding.isPending,
  };
}
