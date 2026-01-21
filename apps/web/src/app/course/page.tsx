"use client";

import React from "react";
import Link from "next/link";
import { characters } from "../../data/characters";

export default function CoursePage() {
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Cours</h1>
      <p className="mb-4">Liste des cours / leçons (prototype).</p>

      <ul className="space-y-2">
        {characters.map((c) => (
          <li key={c.id}>
            <Link
              href={`/langue/${encodeURIComponent(c.lang ?? "en-US")}/${encodeURIComponent(
                c.id
              )}/learn`}
              className="px-3 py-2 border rounded inline-block"
            >
              {c.label} — {c.lang}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <Link href="/langue" className="text-sm text-blue-600">
          Voir les langues
        </Link>
      </div>
    </main>
  );
}
