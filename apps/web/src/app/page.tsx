"use client";

import React from "react";
import Link from "next/link";

const languages = [
  { code: "ja-JP", name: "Japonais", flag: "🇯🇵", script: "Hiragana" },
  { code: "ru-RU", name: "Russe", flag: "🇷🇺", script: "Cyrillique" },
];

export default function HomePage() {
  return (
    <main style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "48px", marginBottom: "10px" }}>Sen</h1>
      <p style={{ fontSize: "18px", color: "#666", marginBottom: "40px" }}>
        Apprends à écrire les écritures du monde
      </p>

      <div style={{ display: "grid", gap: "20px" }}>
        {languages.map((lang) => (
          <Link
            key={lang.code}
            href={`/langue/${encodeURIComponent(lang.code)}`}
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                border: "2px solid #000",
                padding: "30px",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <span style={{ fontSize: "48px" }}>{lang.flag}</span>
              <div>
                <h2 style={{ fontSize: "24px", color: "#000", margin: 0 }}>
                  {lang.name}
                </h2>
                <p style={{ fontSize: "14px", color: "#666", margin: "4px 0 0 0" }}>
                  {lang.script}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
