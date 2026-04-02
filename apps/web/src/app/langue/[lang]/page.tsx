import React from "react";
import Link from "next/link";
import { db } from "@repo/database/client";
import { notFound } from "next/navigation";
import { cn } from "@repo/ui/lib/utils";
import { getSession } from "../../../lib/auth-session";

type Props = { params: Promise<{ lang: string }> };

// A course is unlocked if the previous one is >= 60% mastered
const UNLOCK_THRESHOLD = 0.6;

export default async function LangPage({ params }: Props) {
  const { lang: rawLang } = await params;
  const lang = decodeURIComponent(rawLang);

  // Parallelize session + language lookup (independent)
  const [session, language] = await Promise.all([
    getSession(),
    db.language.findUnique({ where: { code: lang } }),
  ]);

  if (!language) notFound();
  const userId = session?.user.id ?? null;

  // Parallelize courses + progress (both depend on language, but not on each other)
  const [courses, progressRows] = await Promise.all([
    db.course.findMany({
      where: { languageId: language.id, type: "character" },
      orderBy: { level: "asc" },
      include: { characters: { orderBy: { id: "asc" } } },
    }),
    userId
      ? db.userProgress.findMany({
        where: { userId, character: { languageId: language.id } },
        select: { characterId: true, practiceLevel: true },
      })
      : Promise.resolve([]),
  ]);

  // Per-character progress for the authenticated user
  const progressByCharId = new Map(progressRows.map((r) => [r.characterId, r.practiceLevel]));

  // Count mastered chars per course (practiceLevel = 2)
  const masteredByCourse = new Map<string, number>();
  for (const course of courses) {
    const count = course.characters.filter(
      (c) => (progressByCharId.get(c.id) ?? 0) >= 2,
    ).length;
    masteredByCourse.set(course.id, count);
  }

  // Determine locked courses (cascade)
  const lockedCourseIds = new Set<string>();
  for (let i = 1; i < courses.length; i++) {
    const prev = courses[i - 1]!;
    if (lockedCourseIds.has(prev.id)) {
      lockedCourseIds.add(courses[i]!.id);
      continue;
    }
    const mastered = masteredByCourse.get(prev.id) ?? 0;
    const total = prev.characters.length;
    if (total === 0 || mastered / total < UNLOCK_THRESHOLD) {
      lockedCourseIds.add(courses[i]!.id);
    }
  }

  return (
    <main className="container mx-auto max-w-5xl px-4 py-8">
      <Link
        href="/langue"
        className="text-zinc-400 hover:text-white text-sm transition-colors"
      >
        ← Langues
      </Link>

      <h1 className="text-3xl font-bold mt-5 mb-8">
        {language.name}
        {language.script && (
          <span className="text-lg text-zinc-500 ml-3 font-normal">
            {language.script}
          </span>
        )}
      </h1>

      {courses.length === 0 && (
        <p className="text-zinc-500">
          Aucun cours disponible. <code className="text-zinc-400">bun run db:seed</code>
        </p>
      )}

      <div className="grid gap-6">
        {courses.map((course) => {
          const chars = course.characters;
          const isLocked = lockedCourseIds.has(course.id);
          const mastered = masteredByCourse.get(course.id) ?? 0;
          const total = chars.length;
          const masteredPct = total > 0 ? Math.round((mastered / total) * 100) : 0;

          return (
            <div
              key={course.id}
              className={cn(
                "rounded-xl border p-5 transition-opacity",
                isLocked
                  ? "border-zinc-800 bg-zinc-900/50 opacity-60"
                  : "border-zinc-700 bg-zinc-900",
              )}
            >
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className={cn("text-xl font-semibold", isLocked && "text-zinc-500")}>
                    {isLocked ? "🔒 " : ""}{course.title}
                  </h2>
                  {course.description && (
                    <p className="text-sm text-zinc-500 mt-1">{course.description}</p>
                  )}
                </div>
                <div className="text-right text-sm text-zinc-500 shrink-0">
                  <div>{chars.length} caractère{chars.length > 1 ? "s" : ""}</div>
                  {userId && !isLocked && total > 0 && (
                    <div className={cn("mt-1", mastered === total ? "text-green-400" : "text-zinc-500")}>
                      {mastered}/{total} maîtrisés ({masteredPct}%)
                    </div>
                  )}
                  {isLocked && (
                    <div className="mt-1 text-xs text-zinc-600">
                      Maîtrisez {Math.ceil(UNLOCK_THRESHOLD * 100)}% du cours précédent
                    </div>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              {userId && !isLocked && total > 0 && (
                <div className="mb-4">
                  <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="bg-green-500 h-full transition-all duration-300"
                      style={{ width: `${masteredPct}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Character grid */}
              <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))" }}>
                {chars.map((c) => {
                  const romaji = c.romaji ? (JSON.parse(c.romaji) as string[])[0] : null;

                  if (isLocked) {
                    return (
                      <div
                        key={c.id}
                        className="rounded-lg border border-zinc-800 bg-zinc-800/50 p-3 text-center cursor-not-allowed"
                      >
                        <p className="text-3xl text-zinc-600">{c.label}</p>
                        {romaji && (
                          <p className="text-xs mt-1 text-zinc-700">{romaji}</p>
                        )}
                      </div>
                    );
                  }

                  const level = progressByCharId.get(c.id) ?? -1;
                  return (
                    <Link
                      key={c.id}
                      href={`/langue/${encodeURIComponent(lang)}/${encodeURIComponent(c.id)}/learn`}
                    >
                      <div
                        className={cn(
                          "relative rounded-lg p-3 text-center transition-colors hover:brightness-110",
                          level >= 2
                            ? "border-2 border-green-500 bg-green-950/30"
                            : level >= 0
                              ? "border-2 border-yellow-500 bg-yellow-950/20"
                              : "border border-zinc-700 bg-zinc-900 hover:border-zinc-500",
                        )}
                      >
                        {level >= 2 && (
                          <span className="absolute top-1 right-1 text-[10px]">⭐</span>
                        )}
                        {level === 1 && (
                          <span className="absolute top-1 right-1 text-[10px]">✏️</span>
                        )}
                        <p className="text-3xl">{c.label}</p>
                        {romaji && (
                          <p className="text-xs mt-1 text-zinc-400">{romaji}</p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
