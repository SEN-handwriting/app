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
  const isAdmin = session?.user.email === 'hugodemontpro@gmail.com';

  const [courses, wordCourses, phraseCourses, progressRows] = await Promise.all([
    db.course.findMany({
      where: { languageId: language.id, type: "character" },
      orderBy: { level: "asc" },
      include: { characters: { orderBy: { id: "asc" } } },
    }),
    db.course.findMany({
      where: { languageId: language.id, type: "word" },
      orderBy: { level: "asc" },
      include: { words: true },
    }),
    db.course.findMany({
      where: { languageId: language.id, type: "phrase" },
      orderBy: { level: "asc" },
      include: { phrases: true },
    }),
    userId
      ? db.userProgress.findMany({
          where: { userId, character: { languageId: language.id } },
          select: { characterId: true, practiceLevel: true, nextReview: true },
        })
      : Promise.resolve([]),
  ]);

  // ── Progression par caractère ──────────────────────────────────────────────

  const progressByCharId = new Map(progressRows.map((r) => [r.characterId, r.practiceLevel]));

  const now = new Date();
  const dueCharIds = new Set(
    progressRows.filter((r) => r.nextReview <= now).map((r) => r.characterId),
  );

  const masteredByCourse = new Map<string, number>();
  for (const course of courses) {
    const count = course.characters.filter(
      (c) => (progressByCharId.get(c.id) ?? 0) >= 2,
    ).length;
    masteredByCourse.set(course.id, count);
  }

  // ── Verrouillage des cours de caractères (séquentiel) ─────────────────────

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
  if (isAdmin) lockedCourseIds.clear();

  // ── Verrouillage des cours mots/phrases (basé sur le prérequis caractères) ─

  const courseById = new Map(courses.map((c) => [c.id, c]));

  function prereqMet(prerequisiteId: string | null | undefined): boolean {
    if (!prerequisiteId || isAdmin) return true;
    const prereq = courseById.get(prerequisiteId);
    if (!prereq) return false;
    const mastered = masteredByCourse.get(prereq.id) ?? 0;
    const total = prereq.characters.length;
    return total > 0 && mastered / total >= UNLOCK_THRESHOLD;
  }

  function prereqLabel(prerequisiteId: string | null | undefined): string {
    if (!prerequisiteId) return "";
    const prereq = courseById.get(prerequisiteId);
    if (!prereq) return "";
    const mastered = masteredByCourse.get(prereq.id) ?? 0;
    const total = prereq.characters.length;
    const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;
    return `${prereq.title} — ${pct}% / ${Math.ceil(UNLOCK_THRESHOLD * 100)}% requis`;
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

      {/* ── Caractères ──────────────────────────────────────────────────────── */}
      {courses.length > 0 && (
        <h2 className="text-base font-semibold text-zinc-400 uppercase tracking-widest mb-3">
          Caractères
        </h2>
      )}

      <div className="space-y-8">
        {(() => {
          // Regroup courses by script section (hiragana = 1-10, katakana = 11-20, etc.)
          const sections: { label: string; items: typeof courses }[] = [];
          let currentSection: { label: string; items: typeof courses } | null = null;
          for (const course of courses) {
            const sectionLabel =
              course.title.toLowerCase().includes("katakana") ? "Katakana" :
              course.title.toLowerCase().includes("hiragana") ? "Hiragana" :
              course.title.toLowerCase().includes("majuscule") ? "Majuscules" :
              course.title.toLowerCase().includes("minuscule") ? "Minuscules" :
              "Caractères";
            if (!currentSection || currentSection.label !== sectionLabel) {
              currentSection = { label: sectionLabel, items: [] };
              sections.push(currentSection);
            }
            currentSection.items.push(course);
          }

          return sections.map((section) => (
            <div key={section.label}>
              <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-3">
                {section.label}
              </h3>
              <div className="grid gap-4">
                {section.items.map((course) => {
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
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <h2 className={cn("text-base font-semibold", isLocked && "text-zinc-500")}>
                    {isLocked ? "🔒 " : ""}{course.title}
                  </h2>
                </div>
                <div className="text-right shrink-0">
                  {userId && !isLocked && total > 0 && (
                    <div className={cn("text-xs", mastered === total ? "text-green-400" : "text-zinc-500")}>
                      {mastered}/{total}
                    </div>
                  )}
                  {isLocked && (
                    <div className="text-xs text-zinc-600">
                      {Math.ceil(UNLOCK_THRESHOLD * 100)}% requis
                    </div>
                  )}
                </div>
              </div>

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

              <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))" }}>
                {chars.map((c) => {
                  const romaji = c.romaji ? (JSON.parse(c.romaji) as string[])[0] : null;

                  if (isLocked) {
                    return (
                      <div
                        key={c.id}
                        className="rounded-xl border border-zinc-800 bg-zinc-800/50 p-3 text-center cursor-not-allowed"
                      >
                        <p className="text-3xl text-zinc-600">{c.label}</p>
                        {romaji && <p className="text-[10px] mt-1 text-zinc-700">{romaji}</p>}
                      </div>
                    );
                  }

                  const level = progressByCharId.get(c.id) ?? -1;
                  return (
                    <Link
                      key={c.id}
                      href={`/langue/${encodeURIComponent(lang)}/${encodeURIComponent(c.id)}/learn`}
                      className={cn(
                        "relative rounded-xl p-3 text-center transition-colors active:scale-95",
                        level >= 2
                          ? "border-2 border-green-500 bg-green-950/30"
                          : level >= 0
                            ? "border-2 border-yellow-500 bg-yellow-950/20"
                            : "border border-zinc-700 bg-zinc-900 hover:border-zinc-500",
                      )}
                    >
                      {level >= 2 && <span className="absolute top-1 right-1 text-[9px]">⭐</span>}
                      {level === 1 && <span className="absolute top-1 right-1 text-[9px]">✏️</span>}
                      {dueCharIds.has(c.id) && (
                        <span className="absolute top-1 left-1 text-[9px]">🔄</span>
                      )}
                      <p className="text-3xl">{c.label}</p>
                      {romaji && <p className="text-[10px] mt-1 text-zinc-400">{romaji}</p>}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
              </div>
            </div>
          ));
        })()}
      </div>

      {/* ── Mots (masqué pour ja-JP car les kanji sont des cours de caractères) */}
      {wordCourses.length > 0 && lang !== 'ja-JP' && (
        <>
          <h2 className="text-base font-semibold text-zinc-400 uppercase tracking-widest mt-8 mb-2">
            Mots
          </h2>
          <div className="grid gap-3">
            {wordCourses.map((course) => {
              const isLocked = !prereqMet(course.prerequisiteId);
              const hint = isLocked ? prereqLabel(course.prerequisiteId) : null;

              if (isLocked) {
                return (
                  <div
                    key={course.id}
                    className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 opacity-60 cursor-not-allowed"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zinc-500">🔒 {course.title}</p>
                      {hint && <p className="text-xs text-zinc-600 mt-0.5">{hint}</p>}
                      <p className="text-xs text-zinc-700 mt-0.5">{course.words.length} mots</p>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={course.id}
                  href={`/${encodeURIComponent(lang)}/words/${course.level}`}
                  className="flex items-center justify-between rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 hover:border-zinc-500 hover:bg-zinc-800 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{course.title}</p>
                    {course.description && (
                      <p className="text-xs text-zinc-500 mt-0.5">{course.description}</p>
                    )}
                    <p className="text-xs text-zinc-600 mt-0.5">{course.words.length} mots</p>
                  </div>
                  <span className="ml-4 text-zinc-600 text-sm shrink-0">→</span>
                </Link>
              );
            })}
          </div>
        </>
      )}

      {/* ── Phrases (masqué pour ja-JP) ─────────────────────────────────────── */}
      {phraseCourses.length > 0 && lang !== 'ja-JP' && (
        <>
          <h2 className="text-base font-semibold text-zinc-400 uppercase tracking-widest mt-8 mb-2">
            Phrases
          </h2>
          <div className="grid gap-3">
            {phraseCourses.map((course) => {
              const isLocked = !prereqMet(course.prerequisiteId);
              const hint = isLocked ? prereqLabel(course.prerequisiteId) : null;

              if (isLocked) {
                return (
                  <div
                    key={course.id}
                    className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 opacity-60 cursor-not-allowed"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zinc-500">🔒 {course.title}</p>
                      {hint && <p className="text-xs text-zinc-600 mt-0.5">{hint}</p>}
                      <p className="text-xs text-zinc-700 mt-0.5">{course.phrases.length} phrases</p>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={course.id}
                  href={`/${encodeURIComponent(lang)}/phrases/${course.level}`}
                  className="flex items-center justify-between rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 hover:border-zinc-500 hover:bg-zinc-800 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{course.title}</p>
                    {course.description && (
                      <p className="text-xs text-zinc-500 mt-0.5">{course.description}</p>
                    )}
                    <p className="text-xs text-zinc-600 mt-0.5">{course.phrases.length} phrases</p>
                  </div>
                  <span className="ml-4 text-zinc-600 text-sm shrink-0">→</span>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}
