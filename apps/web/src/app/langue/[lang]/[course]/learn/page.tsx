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
      <div style={{ padding: "40px" }}>
        <Link href={`/langue/${lang}`} style={{ color: "blue", textDecoration: "underline" }}>
          ← Retour
        </Link>
        <p style={{ marginTop: "20px", color: "#666" }}>Chargement…</p>
      </div>
    );
  }

  if (isError || !character) {
    return (
      <div style={{ padding: "20px" }}>
        <Link href={`/langue/${lang}`} style={{ color: "blue", textDecoration: "underline" }}>
          ← Retour aux cours
        </Link>
        <h1 style={{ marginTop: "16px" }}>Caractère non trouvé</h1>
        <p style={{ color: "#666" }}>ID : {characterId}</p>
      </div>
    );
  }

  return (
    <main style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
      <Link
        href={`/langue/${lang}`}
        style={{ color: "blue", textDecoration: "underline" }}
      >
        ← Retour aux cours
      </Link>

      <h1 style={{ fontSize: "36px", marginTop: "20px", marginBottom: "30px" }}>
        {character.label}
        {character.romaji?.[0] && (
          <span style={{ fontSize: "20px", color: "#666", marginLeft: "16px", fontWeight: "normal" }}>
            {character.romaji[0]}
          </span>
        )}
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "40px",
          marginTop: "30px",
        }}
      >
        {/* Colonne gauche : Modèle */}
        <div>
          <h2 style={{ fontSize: "24px", marginBottom: "15px" }}>Modèle</h2>
          <CharacterPreview
            ref={previewRef}
            character={character}
            showStrokes={showStrokes}
          />

          <div style={{ marginTop: "20px" }}>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                onClick={() => setShowStrokes(!showStrokes)}
                style={{
                  padding: "10px 20px",
                  cursor: "pointer",
                  backgroundColor: showStrokes ? "#000" : "#fff",
                  color: showStrokes ? "#fff" : "#000",
                  border: "1px solid #000",
                  borderRadius: "4px",
                }}
              >
                {showStrokes ? "Masquer" : "Afficher"} traits
              </button>
              <button
                onClick={() => previewRef.current?.replay()}
                style={{
                  padding: "10px 20px",
                  cursor: "pointer",
                  border: "1px solid #000",
                  borderRadius: "4px",
                }}
              >
                Rejouer
              </button>
              <button
                onClick={() => previewRef.current?.speak()}
                style={{
                  padding: "10px 20px",
                  cursor: "pointer",
                  border: "1px solid #000",
                  borderRadius: "4px",
                }}
              >
                🔊 Écouter
              </button>
            </div>
          </div>

          {/* Infos */}
          <div style={{ marginTop: "30px", fontSize: "14px", lineHeight: "1.8" }}>
            {character.meanings && (
              <p>
                <strong>Signification :</strong>{" "}
                {character.meanings.join(", ")}
              </p>
            )}
            {character.readings?.kana && (
              <p>
                <strong>Lecture :</strong> {character.readings.kana.join(", ")}
              </p>
            )}
            {character.jlpt && (
              <p>
                <strong>JLPT :</strong> {character.jlpt}
              </p>
            )}
            {character.strokeCount && (
              <p>
                <strong>Nombre de traits :</strong> {character.strokeCount}
              </p>
            )}
          </div>
        </div>

        {/* Colonne droite : Zone de pratique */}
        <div>
          <h2 style={{ fontSize: "24px", marginBottom: "15px" }}>
            Zone de pratique
          </h2>
          <p style={{ fontSize: "14px", color: "#666", marginBottom: "15px" }}>
            Tracé complet → pointillés → vide. Le carré passe
            automatiquement au niveau suivant quand vous réussissez !
          </p>
          <PracticeGrid character={character} />
        </div>
      </div>
    </main>
  );
}
