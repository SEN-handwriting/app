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
  const previewRef = useRef<CharacterPreviewHandle | null>(null);
  const [showStrokes, setShowStrokes] = React.useState(true);

  useEffect(() => {
    if (character) {
      setTimeout(() => previewRef.current?.replay(), 50);
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
    <main className="container mx-auto max-w-5xl px-4 py-6 pb-24 md:pb-10">
      <Link
        href={`/langue/${lang}`}
        className="inline-flex items-center text-zinc-400 hover:text-white text-sm transition-colors py-1"
      >
        ← Retour aux cours
      </Link>

      {/* Header */}
      <div className="mt-4 mb-6 flex items-baseline gap-3">
        <h1 className="text-4xl font-bold">{character.label}</h1>
        {character.romaji?.[0] && (
          <span className="text-lg text-zinc-500 font-normal">{character.romaji[0]}</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
        {/* Colonne gauche : Modèle */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-zinc-300">Modèle</h2>
          <CharacterPreview
            ref={previewRef}
            character={character}
            showStrokes={showStrokes}
          />

          {/* Boutons actions — taille tactile confortable */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setShowStrokes(!showStrokes)}
              className="py-3 rounded-xl border border-zinc-700 text-sm hover:bg-zinc-800 transition-colors active:bg-zinc-700"
            >
              {showStrokes ? "Cacher" : "Traits"}
            </button>
            <button
              onClick={() => previewRef.current?.replay()}
              className="py-3 rounded-xl border border-zinc-700 text-sm hover:bg-zinc-800 transition-colors active:bg-zinc-700"
            >
              Rejouer
            </button>
            <button
              onClick={() => previewRef.current?.speak()}
              className="py-3 rounded-xl border border-zinc-700 text-sm hover:bg-zinc-800 transition-colors active:bg-zinc-700"
            >
              🔊
            </button>
          </div>

          {/* Infos caractère */}
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

        {/* Colonne droite : Zone de pratique */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-zinc-300">Zone de pratique</h2>
          <p className="text-xs text-zinc-500">
            Tracé complet → pointillés → vide. Réussis pour avancer automatiquement !
          </p>
          <PracticeGrid character={character} />
        </div>
      </div>
    </main>
  );
}
