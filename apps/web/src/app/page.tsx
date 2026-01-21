"use client";

import React from "react";
import Link from "next/link";

export default function HomePage() {
  const languages = [{ code: "ja-JP", name: "Japonais", flag: "🇯🇵" }];

  return (
    <main style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "48px", marginBottom: "20px" }}>
        Sen - Learn the line
      </h1>
      <p style={{ fontSize: "18px", marginBottom: "40px" }}>
        Sélectionnez une langue
      </p>

      <div style={{ display: "grid", gap: "20px" }}>
        {languages.map(lang => (
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
              <h2 style={{ fontSize: "24px", color: "#000" }}>{lang.name}</h2>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
