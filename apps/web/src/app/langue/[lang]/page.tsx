import React from "react";
import Link from "next/link";
import { db } from "@repo/database/client";
import { notFound } from "next/navigation";
import { cn } from "@repo/ui/lib/utils";
import { getSession } from "../../../lib/auth-session";
import { RotateCcw } from "lucide-react";

type Props = { params: Promise<{ lang: string }> };

const UNLOCK_THRESHOLD = 0.6;

export default async function LangPage({ params }: Props) {
  const { lang: rawLang } = await params;
  const lang = decodeURIComponent(rawLang);

  const [session, language] = await Promise.all([
    getSession(),
    db.language.findUnique({ where: { code: lang } }),
  ]);

  if (!language) notFound();
  const userId = session?.user.id ?? null;

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

  const progressByCharId = new Map(progressRows.map((r) => [r.characterId, r.practiceLevel]));

  const masteredByCourse = new Map<string, number>();
  for (const course of courses) {
    const count = course.characters.filter(
      (c) => (progressByCharId.get(c.id) ?? 0) >= 2,
    ).length;
    masteredByCourse.set(course.id, count);
  }

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
    <main className="container mx-auto max-w-5xl px-4 py-6 pb-24 md:pb-10">
      <Link href="/langue" className="inline-flex items-center text-zinc-400 hover:text-white text-sm transition-colors py-1">
        ← Langues
      </Link>

      <div className="mt-4 mb-6">
        <h1 className="text-2xl font-bold">
          {language.name}
          {language.script && (
            <span className="text-base text-zinc-500 ml-2 font-normal">{language.script}</span>
          )}
        </h1>
      </div>

      {userId && (
        <Link
          href="/revision"
          className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 mb-6 hover:border-zinc-500 hover:bg-zinc-800 transition-colors"
        >
          <RotateCcw size={18} className="text-zinc-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold">Révisions</p>
            <p className="text-xs text-zinc-500">Revoir les caractères appris</p>
          </div>
          <span className="ml-auto text-zinc-600 text-sm">→</span>
        </Link>
      )}

      {courses.length === 0 && (
        <p className="text-zinc-500">Aucun cours disponible.</p>
      )}

      <div className="grid gap-4">
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
                "rounded-xl border p-4 transition-opacity",
                isLocked
                  ? "border-zinc-800 bg-zinc-900/50 opacity-60"
                  : "border-zinc-700 bg-zinc-900",
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <h2 className={cn("text-lg font-semibold", isLocked && "text-zinc-500")}>
                    {isLocked ? "🔒 " : ""}{course.title}
                  </h2>
                  {course.description && (
                    <p className="text-sm text-zinc-500 mt-0.5">{course.description}</p>
                  )}
                </div>
                <div className="text-right text-sm text-zinc-500 shrink-0">
                  <div className="text-xs">{chars.length} chars</div>
                  {userId && !isLocked && total > 0 && (
                    <div className={cn("text-xs mt-0.5", mastered === total ? "text-green-400" : "text-zinc-500")}>
                      {mastered}/{total} ({masteredPct}%)
                    </div>
                  )}
                  {isLocked && (
                    <div className="text-xs text-zinc-600 mt-0.5">
                      {Math.ceil(UNLOCK_THRESHOLD * 100)}% requis
                    </div>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              {userId && !isLocked && total > 0 && (
                <div className="mb-3">
                  <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="bg-green-500 h-full transition-all duration-300"
                      style={{ width: `${masteredPct}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Character grid */}
              <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(68px, 1fr))" }}>
                {chars.map((c) => {
                  const romaji = c.romaji ? (JSON.parse(c.romaji) as string[])[0] : null;

                  if (isLocked) {
                    return (
                      <div
                        key={c.id}
                        className="rounded-xl border border-zinc-800 bg-zinc-800/50 p-2.5 text-center cursor-not-allowed"
                      >
                        <p className="text-2xl text-zinc-600">{c.label}</p>
                        {romaji && <p className="text-[10px] mt-0.5 text-zinc-700">{romaji}</p>}
                      </div>
                    );
                  }

                  const level = progressByCharId.get(c.id) ?? -1;
                  return (
                    <Link
                      key={c.id}
                      href={`/langue/${encodeURIComponent(lang)}/${encodeURIComponent(c.id)}/learn`}
                      className={cn(
                        "relative rounded-xl p-2.5 text-center transition-colors active:scale-95",
                        level >= 2
                          ? "border-2 border-green-500 bg-green-950/30"
                          : level >= 0
                            ? "border-2 border-yellow-500 bg-yellow-950/20"
                            : "border border-zinc-700 bg-zinc-900 hover:border-zinc-500",
                      )}
                    >
                      {level >= 2 && <span className="absolute top-1 right-1 text-[9px]">⭐</span>}
                      {level === 1 && <span className="absolute top-1 right-1 text-[9px]">✏️</span>}
                      <p className="text-2xl">{c.label}</p>
                      {romaji && <p className="text-[10px] mt-0.5 text-zinc-400">{romaji}</p>}
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
