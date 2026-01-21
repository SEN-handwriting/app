"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import CharacterPreview, {
  CharacterPreviewHandle,
} from "../../../../../components/CharacterPreview";
import PracticeGrid from "../../../../../components/PracticeGrid";
import { characters } from "../../../../../data/characters";

export default function LearnPage() {
  const params = useParams();
  const rawLang = params?.lang;
  const rawCourse = params?.course;
  const lang = Array.isArray(rawLang) ? rawLang[0] : rawLang;
  const course = Array.isArray(rawCourse) ? rawCourse[0] : rawCourse;

  const [showStrokes, setShowStrokes] = useState(true);
  const previewRef = useRef<CharacterPreviewHandle | null>(null);

  function findCharacter(param?: string | string[]) {
    if (!param) return undefined;
    const raw = Array.isArray(param) ? param[0] : param;
    if (!raw) return undefined;

    let decoded = raw;
    try {
      decoded = decodeURIComponent(raw);
    } catch {}

    let found = characters.find(c => c.id === raw || c.id === decoded);
    if (found) return found;

    found = characters.find(c => c.label === raw || c.label === decoded);
    if (found) return found;

    return undefined;
  }

  const selected = findCharacter(course);

  useEffect(() => {
    setTimeout(() => previewRef.current?.replay(), 50);
  }, [course]);

  if (!selected) {
    return (
      <div style={{ padding: "20px" }}>
        <Link href={`/langue/${lang}`}>Retour aux cours</Link>
        <h1>Caractère non trouvé</h1>
        <p>ID recherché: {course}</p>
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
        Cours {selected.courseLevel} - {selected.label}
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "40px",
          marginTop: "30px",
        }}
      >
        {/* Colonne gauche : Modèle et infos */}
        <div>
          <h2 style={{ fontSize: "24px", marginBottom: "15px" }}>Modèle</h2>
          <CharacterPreview
            ref={previewRef}
            character={selected}
            showStrokes={showStrokes}
          />

          <div style={{ marginTop: "20px" }}>
            <h3 style={{ fontSize: "18px", marginBottom: "10px" }}>
              Contrôles
            </h3>
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

          {selected.meanings && (
            <div style={{ marginTop: "30px" }}>
              <h3 style={{ fontSize: "18px", marginBottom: "10px" }}>
                Informations
              </h3>
              <div style={{ fontSize: "14px", lineHeight: "1.8" }}>
                <p>
                  <strong>Signification:</strong> {selected.meanings.join(", ")}
                </p>
                {selected.readings?.kana && (
                  <p>
                    <strong>Lecture:</strong>{" "}
                    {selected.readings.kana.join(", ")}
                  </p>
                )}
                {selected.romaji && (
                  <p>
                    <strong>Rōmaji:</strong> {selected.romaji.join(", ")}
                  </p>
                )}
                {selected.jlpt && (
                  <p>
                    <strong>JLPT:</strong> {selected.jlpt}
                  </p>
                )}
                {selected.strokeCount && (
                  <p>
                    <strong>Nombre de traits:</strong> {selected.strokeCount}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Colonne droite : Zone de pratique */}
        <div>
          <h2 style={{ fontSize: "24px", marginBottom: "15px" }}>
            Zone de pratique
          </h2>
          <p style={{ fontSize: "14px", color: "#666", marginBottom: "15px" }}>
            Progression : tracé complet → pointillés → vide. Le carré passe
            automatiquement au niveau suivant quand vous réussissez !
          </p>

          <PracticeGrid character={selected} />
        </div>
      </div>
    </main>
  );
}
