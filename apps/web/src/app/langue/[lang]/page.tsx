"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCharacters } from "../../../hooks/useCharacters";

const LANG_LABELS: Record<string, string> = {
  "ja-JP": "Japonais — Hiragana",
  "ru-RU": "Russe — Cyrillique",
};

export default function LangPage() {
  const params = useParams();
  const rawLang = params?.lang;
  const lang = (
    Array.isArray(rawLang) ? rawLang[0] : (rawLang ?? "ja-JP")
  ) as string;

  const { data: characters = [], isLoading, isError } = useCharacters(lang);

  const courses = Array.from(
    new Set(characters.map((c) => c.courseLevel)),
  ).sort((a, b) => a - b);

  return (
    <main style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      <Link
        href="/"
        style={{ color: "blue", textDecoration: "underline", fontSize: "16px" }}
      >
        ← Retour aux langues
      </Link>

      <h1 style={{ fontSize: "36px", marginTop: "20px", marginBottom: "30px" }}>
        {LANG_LABELS[lang] ?? lang}
      </h1>

      {isLoading && (
        <p style={{ color: "#666" }}>Chargement des caractères…</p>
      )}

      {isError && (
        <p style={{ color: "#ef4444" }}>
          Erreur lors du chargement. Veuillez réessayer.
        </p>
      )}

      <div style={{ display: "grid", gap: "20px" }}>
        {courses.map((level) => {
          const courseChars = characters.filter(
            (c) => c.courseLevel === level,
          );
          const levelLabel =
            lang === "ru-RU"
              ? level === 1
                ? "Niveau 1 — Voyelles"
                : "Niveau 2 — Consonnes"
              : `Cours ${level}`;

          return (
            <div
              key={level}
              style={{
                border: "2px solid #000",
                padding: "20px",
                borderRadius: "8px",
              }}
            >
              <h2 style={{ fontSize: "24px", marginBottom: "15px" }}>
                {levelLabel}
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                  gap: "15px",
                }}
              >
                {courseChars.map((c) => (
                  <Link
                    key={c.id}
                    href={`/langue/${encodeURIComponent(lang)}/${encodeURIComponent(c.id)}/learn`}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      style={{
                        border: "1px solid #ccc",
                        padding: "20px",
                        borderRadius: "8px",
                        textAlign: "center",
                        cursor: "pointer",
                        backgroundColor: "#fff",
                      }}
                    >
                      <p
                        style={{ fontSize: "36px", margin: "0", color: "#000" }}
                      >
                        {c.label}
                      </p>
                      <p
                        style={{
                          fontSize: "12px",
                          marginTop: "5px",
                          color: "#666",
                        }}
                      >
                        {c.romaji?.[0] ?? ""}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
