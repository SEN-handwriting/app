"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useUserLanguages } from "../../hooks/useUserLanguages";
import type { UserLanguageItem } from "../api/user/languages/route";

export default function LanguePage() {
  const { active, others, isLoading, addLanguage, removeLanguage } = useUserLanguages();

  if (isLoading) {
    return (
      <main className="container mx-auto max-w-2xl px-4 py-6 pb-24 md:pb-10">
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-2xl px-4 py-6 pb-24 md:pb-10 space-y-8">
      {/* Section Mes langues */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Mes langues</h2>
        {active.length === 0 ? (
          <p className="text-zinc-500 text-sm">Aucune langue active.</p>
        ) : (
          <div className="space-y-2">
            {active.map(lang => (
              <ActiveLanguageCard
                key={lang.languageId}
                lang={lang}
                onRemove={() => removeLanguage(lang.languageId)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Section Explorer */}
      {others.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Explorer</h2>
          <div className="space-y-2">
            {others.map(lang => (
              <OtherLanguageCard
                key={lang.languageId}
                lang={lang}
                onAdd={() => addLanguage(lang.languageId)}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function ActiveLanguageCard({
  lang,
  onRemove,
}: {
  lang: UserLanguageItem;
  onRemove: () => void;
}) {
  const [swiped, setSwiped] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const touchStartX = useRef(0);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]!.clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const delta = touchStartX.current - e.changedTouches[0]!.clientX;
    if (delta > 60) setSwiped(true);
    else if (delta < -20) { setSwiped(false); setConfirming(false); }
  }

  function handleRemoveTap() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    onRemove();
    setSwiped(false);
    setConfirming(false);
  }

  return (
    <div
      className="relative overflow-hidden rounded-xl"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Bouton Retirer en arrière-plan */}
      <div className="absolute inset-y-0 right-0 w-24 flex items-center justify-center bg-red-600 rounded-r-xl">
        <button
          onClick={handleRemoveTap}
          className="w-full h-full flex items-center justify-center text-white text-sm font-bold"
        >
          {confirming ? "Sûr ?" : "Retirer"}
        </button>
      </div>

      {/* Carte principale */}
      <div
        className="relative transition-transform duration-200 ease-out bg-zinc-900 border border-zinc-700 rounded-xl"
        style={{ transform: swiped ? "translateX(-96px)" : "translateX(0)" }}
      >
        <Link
          href={`/langue/${encodeURIComponent(lang.languageCode)}`}
          className="flex items-center gap-4 p-4"
        >
          <span className="text-3xl shrink-0">{lang.flag}</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold">{lang.name}</p>
            {lang.script && <p className="text-sm text-zinc-400">{lang.script}</p>}
          </div>
          <span className="text-zinc-500 text-sm shrink-0">→</span>
        </Link>

        {/* Bouton retirer desktop */}
        <button
          onClick={() => { setConfirming(true); if (confirming) onRemove(); }}
          className="hidden md:block absolute right-12 top-1/2 -translate-y-1/2 text-xs text-zinc-600 hover:text-red-400 transition-colors px-2 py-1"
        >
          {confirming ? "Confirmer ?" : "Retirer"}
        </button>
      </div>
    </div>
  );
}

function OtherLanguageCard({
  lang,
  onAdd,
}: {
  lang: UserLanguageItem;
  onAdd: () => void;
}) {
  return (
    <button
      onClick={onAdd}
      className="w-full flex items-center gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 opacity-60 hover:opacity-100 transition-opacity text-left active:scale-[0.98]"
    >
      <span className="text-3xl shrink-0">{lang.flag}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold">{lang.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {lang.script && <span className="text-sm text-zinc-400">{lang.script}</span>}
          {lang.hasProgress && (
            <span className="text-[10px] font-medium bg-yellow-900/60 text-yellow-400 border border-yellow-800 px-1.5 py-0.5 rounded-full">
              Déjà commencé
            </span>
          )}
        </div>
      </div>
      <span className="text-zinc-500 text-sm shrink-0">+ Ajouter</span>
    </button>
  );
}
