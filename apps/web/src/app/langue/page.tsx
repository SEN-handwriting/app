"use client";

import React from "react";
import Link from "next/link";
import { characters } from "../../data/characters";

export default function LanguePage() {
  // collect available languages from characters
  const langs = Array.from(new Set(characters.map((c) => c.lang ?? "en-US")));

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Langues</h1>
      <p className="mb-4">Sélectionnez une langue pour voir les cours disponibles.</p>

      <ul className="space-y-2">
        {langs.map((lang) => (
          <li key={lang}>
            <Link href={`/langue/${encodeURIComponent(lang)}/`} className="px-3 py-2 border rounded inline-block">
              {lang}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <Link href="/course" className="text-sm text-blue-600">Voir les cours</Link>
      </div>
    </main>
  );
}
