"use client";

import React, { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import CharacterPreview, {
  CharacterPreviewHandle,
} from "../../../../../components/CharacterPreview";
import PracticeGrid from "../../../../../components/PracticeGrid";
import { useCharacter } from "../../../../../hooks/useCharacters";

export default function LearnPage() {
  const params = useParams();
  const rawLang = params?.lang;
  const rawCourse = params?.course;

  const lang = Array.isArray(rawLang) ? rawLang[0] : (rawLang ?? "");
  const courseParam = Array.isArray(rawCourse) ? (rawCourse[0] ?? "") : (rawCourse ?? "");

  let characterId = "";
  try {
    characterId = decodeURIComponent(courseParam);
  } catch {
    characterId = courseParam;
  }

  const { data: character, isLoading, isError } = useCharacter(characterId);
  const mobilePreviewRef = useRef<CharacterPreviewHandle | null>(null);
  const desktopPreviewRef = useRef<CharacterPreviewHandle | null>(null);
  const [showStrokes, setShowStrokes] = React.useState(true);
  const [showInfo, setShowInfo] = React.useState(false);

  useEffect(() => {
    if (character) {
      setTimeout(() => {
        mobilePreviewRef.current?.replay();
        desktopPreviewRef.current?.replay();
      }, 50);
    }
  }, [character]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 pb-24 md:pb-10">
        <Link href={`/langue/${lang}`} className="text-zinc-400 hover:text-white text-sm transition-colors">
          ← Retour
        </Link>
        <p className="mt-5 text-zinc-500">Chargement…</p>
      </div>
    );
  }

  if (isError || !character) {
    return (
      <div className="container mx-auto px-4 py-6 pb-24 md:pb-10">
        <Link href={`/langue/${lang}`} className="text-zinc-400 hover:text-white text-sm transition-colors">
          ← Retour aux cours
        </Link>
        <h1 className="text-2xl font-bold mt-4">Caractère non trouvé</h1>
        <p className="text-zinc-500 mt-2">ID : {characterId}</p>
      </div>
    );
  }

  return (
    <>
      {/* ── MOBILE layout ── */}
      <div className="md:hidden flex flex-col" style={{ height: "calc(100dvh - 8rem)" }}>
        {/* Top block: character reference */}
        <div className="flex-none border-b border-zinc-800 px-4 pt-2 pb-3">
          <div className="flex items-center justify-between mb-2">
            <Link
              href={`/langue/${lang}`}
              className="text-zinc-400 hover:text-white text-sm transition-colors"
            >
              ← Retour
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{character.label}</span>
              {character.romaji?.[0] && (
                <span className="text-sm text-zinc-500">{character.romaji[0]}</span>
              )}
            </div>
            <button
              onClick={() => setShowInfo(true)}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-zinc-700 text-zinc-400 hover:bg-zinc-800 transition-colors text-sm"
              aria-label="Informations"
            >
              ℹ️
            </button>
          </div>

          <div className="flex justify-center">
            <CharacterPreview
              ref={mobilePreviewRef}
              character={character}
              showStrokes={showStrokes}
              size={150}
              showLabel={false}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2">
            <button
              onClick={() => setShowStrokes(!showStrokes)}
              className="py-2.5 rounded-xl border border-zinc-700 text-xs hover:bg-zinc-800 transition-colors active:bg-zinc-700"
            >
              {showStrokes ? "Cacher" : "Traits"}
            </button>
            <button
              onClick={() => mobilePreviewRef.current?.replay()}
              className="py-2.5 rounded-xl border border-zinc-700 text-xs hover:bg-zinc-800 transition-colors active:bg-zinc-700"
            >
              Rejouer
            </button>
            <button
              onClick={() => mobilePreviewRef.current?.speak()}
              className="py-2.5 rounded-xl border border-zinc-700 text-xs hover:bg-zinc-800 transition-colors active:bg-zinc-700"
            >
              🔊 Son
            </button>
          </div>
        </div>

        {/* Bottom block: writing zone */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <PracticeGrid
            character={character}
            canvasClassName="max-w-[260px] mx-auto"
          />
        </div>
      </div>

      {/* Info bottom sheet (mobile) */}
      {showInfo && (
        <div
          className="fixed inset-0 z-50 bg-black/60 md:hidden"
          onClick={() => setShowInfo(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-700 rounded-t-2xl px-5 pt-5 pb-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-base">{character.label}</span>
              <button
                onClick={() => setShowInfo(false)}
                className="text-zinc-400 hover:text-white text-xl w-8 h-8 flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-sm">
              {character.meanings && (
                <div className="flex gap-3">
                  <span className="text-zinc-500 w-16 shrink-0">Sens</span>
                  <span className="text-zinc-200">{character.meanings.join(", ")}</span>
                </div>
              )}
              {character.readings?.kana && (
                <div className="flex gap-3">
                  <span className="text-zinc-500 w-16 shrink-0">Lecture</span>
                  <span className="text-zinc-200">{character.readings.kana.join(", ")}</span>
                </div>
              )}
              {character.jlpt && (
                <div className="flex gap-3">
                  <span className="text-zinc-500 w-16 shrink-0">JLPT</span>
                  <span className="text-zinc-200">{character.jlpt}</span>
                </div>
              )}
              {character.strokeCount && (
                <div className="flex gap-3">
                  <span className="text-zinc-500 w-16 shrink-0">Traits</span>
                  <span className="text-zinc-200">{character.strokeCount}</span>
                </div>
              )}
              <p className="pt-3 text-zinc-500 text-xs border-t border-zinc-800">
                Tracé complet → pointillés → vide. Réussis pour avancer automatiquement !
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── DESKTOP layout ── */}
      <main className="hidden md:block container mx-auto max-w-5xl px-4 py-6 pb-10">
        <Link
          href={`/langue/${lang}`}
          className="inline-flex items-center text-zinc-400 hover:text-white text-sm transition-colors py-1"
        >
          ← Retour aux cours
        </Link>

        <div className="mt-4 mb-6 flex items-baseline gap-3">
          <h1 className="text-4xl font-bold">{character.label}</h1>
          {character.romaji?.[0] && (
            <span className="text-lg text-zinc-500 font-normal">{character.romaji[0]}</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-12">
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-zinc-300">Modèle</h2>
            <CharacterPreview
              ref={desktopPreviewRef}
              character={character}
              showStrokes={showStrokes}
              showLabel={false}
            />

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setShowStrokes(!showStrokes)}
                className="py-3 rounded-xl border border-zinc-700 text-sm hover:bg-zinc-800 transition-colors active:bg-zinc-700"
              >
                {showStrokes ? "Cacher" : "Traits"}
              </button>
              <button
                onClick={() => desktopPreviewRef.current?.replay()}
                className="py-3 rounded-xl border border-zinc-700 text-sm hover:bg-zinc-800 transition-colors active:bg-zinc-700"
              >
                Rejouer
              </button>
              <button
                onClick={() => desktopPreviewRef.current?.speak()}
                className="py-3 rounded-xl border border-zinc-700 text-sm hover:bg-zinc-800 transition-colors active:bg-zinc-700"
              >
                🔊
              </button>
            </div>

            {(character.meanings || character.readings?.kana || character.jlpt || character.strokeCount) && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-2 text-sm">
                {character.meanings && (
                  <div className="flex gap-2">
                    <span className="text-zinc-500 shrink-0">Sens</span>
                    <span className="text-zinc-200">{character.meanings.join(", ")}</span>
                  </div>
                )}
                {character.readings?.kana && (
                  <div className="flex gap-2">
                    <span className="text-zinc-500 shrink-0">Lecture</span>
                    <span className="text-zinc-200">{character.readings.kana.join(", ")}</span>
                  </div>
                )}
                {character.jlpt && (
                  <div className="flex gap-2">
                    <span className="text-zinc-500 shrink-0">JLPT</span>
                    <span className="text-zinc-200">{character.jlpt}</span>
                  </div>
                )}
                {character.strokeCount && (
                  <div className="flex gap-2">
                    <span className="text-zinc-500 shrink-0">Traits</span>
                    <span className="text-zinc-200">{character.strokeCount}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-semibold text-zinc-300">Zone de pratique</h2>
            <p className="text-xs text-zinc-500">
              Tracé complet → pointillés → vide. Réussis pour avancer automatiquement !
            </p>
            <PracticeGrid character={character} />
          </div>
        </div>
      </main>
    </>
  );
}
