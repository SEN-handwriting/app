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
  const courseParam = Array.isArray(rawCourse)
    ? rawCourse[0]
    : (rawCourse ?? "");

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
      <div className="container mx-auto px-4 py-10">
        <Link href={`/langue/${lang}`} className="text-zinc-400 hover:text-white text-sm transition-colors">
          ← Retour
        </Link>
        <p className="mt-5 text-zinc-500">Chargement…</p>
      </div>
    );
  }

  if (isError || !character) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Link href={`/langue/${lang}`} className="text-zinc-400 hover:text-white text-sm transition-colors">
          ← Retour aux cours
        </Link>
        <h1 className="text-2xl font-bold mt-4">Caractère non trouvé</h1>
        <p className="text-zinc-500 mt-2">ID : {characterId}</p>
      </div>
    );
  }

  return (
    <main className="container mx-auto max-w-5xl px-4 py-8">
      <Link
        href={`/langue/${lang}`}
        className="text-zinc-400 hover:text-white text-sm transition-colors"
      >
        ← Retour aux cours
      </Link>

      <h1 className="text-3xl font-bold mt-5 mb-8">
        {character.label}
        {character.romaji?.[0] && (
          <span className="text-lg text-zinc-500 ml-4 font-normal">
            {character.romaji[0]}
          </span>
        )}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Colonne gauche : Modèle */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Modèle</h2>
          <CharacterPreview
            ref={previewRef}
            character={character}
            showStrokes={showStrokes}
          />

          <div className="flex flex-wrap gap-2 mt-5">
            <button
              onClick={() => setShowStrokes(!showStrokes)}
              className="px-4 py-2 rounded-lg border border-zinc-700 text-sm hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              {showStrokes ? "Masquer" : "Afficher"} traits
            </button>
            <button
              onClick={() => previewRef.current?.replay()}
              className="px-4 py-2 rounded-lg border border-zinc-700 text-sm hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Rejouer
            </button>
            <button
              onClick={() => previewRef.current?.speak()}
              className="px-4 py-2 rounded-lg border border-zinc-700 text-sm hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              🔊 Écouter
            </button>
          </div>

          <div className="mt-6 text-sm text-zinc-400 space-y-1.5">
            {character.meanings && (
              <p>
                <span className="text-white font-medium">Signification :</span>{" "}
                {character.meanings.join(", ")}
              </p>
            )}
            {character.readings?.kana && (
              <p>
                <span className="text-white font-medium">Lecture :</span>{" "}
                {character.readings.kana.join(", ")}
              </p>
            )}
            {character.jlpt && (
              <p>
                <span className="text-white font-medium">JLPT :</span>{" "}
                {character.jlpt}
              </p>
            )}
            {character.strokeCount && (
              <p>
                <span className="text-white font-medium">Nombre de traits :</span>{" "}
                {character.strokeCount}
              </p>
            )}
          </div>
        </div>

        {/* Colonne droite : Zone de pratique */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Zone de pratique</h2>
          <p className="text-sm text-zinc-500 mb-4">
            Tracé complet → pointillés → vide. Le carré passe
            automatiquement au niveau suivant quand vous réussissez !
          </p>
          <PracticeGrid character={character} />
        </div>
      </div>
    </main>
  );
}
