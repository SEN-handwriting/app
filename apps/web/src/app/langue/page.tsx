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
  { revalidate: 3600 },
);

export default async function LanguePage() {
  const languages = await getLanguages();

  return (
    <main className="container mx-auto max-w-2xl px-4 py-6 pb-24 md:pb-10">
      <Link href="/" className="inline-flex items-center text-zinc-400 hover:text-white text-sm transition-colors py-1">
        ← Accueil
      </Link>

      <div className="mt-4 mb-6">
        <h1 className="text-2xl font-bold">Langues disponibles</h1>
        <p className="text-zinc-400 text-sm mt-1">Choisis une langue pour accéder aux cours.</p>
      </div>

      {languages.length === 0 ? (
        <p className="text-zinc-500 text-sm">
          Aucune langue disponible. <code className="text-zinc-400">bun run db:seed</code>
        </p>
      ) : (
        <div className="grid gap-3">
          {languages.map((lang) => (
            <Link
              key={lang.id}
              href={`/langue/${encodeURIComponent(lang.code)}`}
              className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-5 hover:border-zinc-600 transition-colors active:bg-zinc-800"
            >
              <span className="text-4xl">{FLAG[lang.code] ?? "🌐"}</span>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold">{lang.name}</h2>
                <p className="text-sm text-zinc-400 mt-0.5">
                  {lang.script} · {lang._count.characters} caractères · {lang._count.courses} cours
                </p>
              </div>
              <span className="text-zinc-500 text-lg shrink-0">→</span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
