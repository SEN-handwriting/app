"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserLanguages } from "../../hooks/useUserLanguages";
import { useProfile } from "#auth/hooks/useProfile";

export default function OnboardingPage() {
  const router = useRouter();
  const { active, others, isLoading, saveOnboarding, isSaving } = useUserLanguages();
  const { data: profile } = useProfile();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  React.useEffect(() => {
    if (!isLoading && active.length > 0) {
      router.replace("/dashboard");
    }
  }, [isLoading, active.length, router]);

  function toggle(languageId: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(languageId)) {
        next.delete(languageId);
      } else {
        next.add(languageId);
      }
      return next;
    });
  }

  async function handleSubmit() {
    if (selected.size === 0) return;
    await saveOnboarding(Array.from(selected));
    router.replace("/dashboard");
  }

  const allLanguages = [...others];

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center">
        <p className="text-zinc-400">Chargement…</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-none px-6 pt-14 pb-6">
        {profile?.user?.name && (
          <p className="text-zinc-400 text-sm mb-1">Bienvenue, {profile.user.name} 👋</p>
        )}
        <h1 className="text-2xl font-bold">Choisir un système d'écriture</h1>
        <p className="text-zinc-500 text-sm mt-1">Tu peux en ajouter d'autres plus tard.</p>
      </div>

      {/* Language list */}
      <div className="flex-1 overflow-y-auto px-6 space-y-3 pb-32">
        {allLanguages.map(lang => {
          const isSelected = selected.has(lang.languageId);
          return (
            <button
              key={lang.languageId}
              onClick={() => toggle(lang.languageId)}
              className={[
                "w-full flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all active:scale-[0.98]",
                isSelected
                  ? "border-white bg-white/10"
                  : "border-zinc-800 bg-zinc-900 hover:border-zinc-600",
              ].join(" ")}
            >
              <span className="text-4xl shrink-0">{lang.flag}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base">{lang.name}</p>
                {lang.script && (
                  <p className="text-sm text-zinc-400 mt-0.5">{lang.script}</p>
                )}
              </div>
              <div
                className={[
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                  isSelected
                    ? "border-white bg-white"
                    : "border-zinc-600",
                ].join(" ")}
              >
                {isSelected && (
                  <svg viewBox="0 0 12 10" className="w-3 h-3" fill="none">
                    <path d="M1 5l3.5 3.5L11 1" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* CTA sticky */}
      <div className="flex-none fixed bottom-0 left-0 right-0 z-[61] px-6 pb-8 pt-4 bg-gradient-to-t from-black to-transparent">
        <button
          onClick={handleSubmit}
          disabled={selected.size === 0 || isSaving}
          className={[
            "w-full h-14 rounded-2xl text-base font-bold transition-all",
            selected.size > 0 && !isSaving
              ? "bg-white text-black active:scale-[0.98]"
              : "bg-zinc-800 text-zinc-500 cursor-not-allowed",
          ].join(" ")}
        >
          {isSaving ? "Enregistrement…" : `Commencer${selected.size > 0 ? ` (${selected.size})` : ""} →`}
        </button>
      </div>
    </div>
  );
}
