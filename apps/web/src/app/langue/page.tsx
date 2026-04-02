import React from "react";
import Link from "next/link";
import { db } from "@repo/database/client";
import { unstable_cache } from "next/cache";

const FLAG: Record<string, string> = {
  "ja-JP": "🇯🇵",
  "ru-RU": "🇷🇺",
};

const getLanguages = unstable_cache(
  () =>
    db.language.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: { _count: { select: { characters: true, courses: true } } },
    }),
  ["languages-list"],
  { revalidate: 3600 }, // 1h — languages almost never change
);

export default async function LanguePage() {
  const languages = await getLanguages();

  return (
    <main style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <Link
        href="/"
        style={{ color: "blue", textDecoration: "underline", fontSize: "16px" }}
      >
        ← Accueil
      </Link>

      <h1 style={{ fontSize: "36px", marginTop: "20px", marginBottom: "8px" }}>
        Langues disponibles
      </h1>
      <p style={{ color: "#666", marginBottom: "32px" }}>
        Choisissez une langue pour accéder aux cours.
      </p>

      <div style={{ display: "grid", gap: "16px" }}>
        {languages.map(lang => (
          <Link
            key={lang.id}
            href={`/langue/${encodeURIComponent(lang.code)}`}
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                border: "2px solid #000",
                padding: "24px",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <span style={{ fontSize: "40px" }}>
                {FLAG[lang.code] ?? "🌐"}
              </span>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: "22px", color: "#000", margin: 0 }}>
                  {lang.name}
                </h2>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#666",
                    margin: "4px 0 0 0",
                  }}
                >
                  {lang.script} · {lang._count.characters} caractères ·{" "}
                  {lang._count.courses} cours
                </p>
              </div>
              <span style={{ fontSize: "20px", color: "#999" }}>→</span>
            </div>
          </Link>
        ))}

        {languages.length === 0 && (
          <p style={{ color: "#999" }}>
            Aucune langue disponible. <code>bun run db:seed</code> pour peupler
            la base.
          </p>
        )}
      </div>
    </main>
  );
}
