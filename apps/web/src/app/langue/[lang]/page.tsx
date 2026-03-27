import React from "react";
import Link from "next/link";
import { db } from "@repo/database/client";
import { auth } from "@repo/auth/server";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ lang: string }> };

// A course is unlocked if the previous one is >= 60% mastered
const UNLOCK_THRESHOLD = 0.6;

export default async function LangPage({ params }: Props) {
  const { lang: rawLang } = await params;
  const lang = decodeURIComponent(rawLang);

  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user.id ?? null;

  const language = await db.language.findUnique({ where: { code: lang } });
  if (!language) notFound();

  const courses = await db.course.findMany({
    where: { languageId: language.id, type: "character" },
    orderBy: { level: "asc" },
    include: { characters: { orderBy: { id: "asc" } } },
  });

  // Per-character progress for the authenticated user
  const progressByCharId = userId
    ? await db.userProgress
        .findMany({
          where: { userId, character: { languageId: language.id } },
          select: { characterId: true, practiceLevel: true },
        })
        .then((rows) => new Map(rows.map((r) => [r.characterId, r.practiceLevel])))
    : new Map<string, number>();

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
    <main style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      <Link href="/langue" style={{ color: "blue", textDecoration: "underline", fontSize: "16px" }}>
        ← Langues
      </Link>

      <h1 style={{ fontSize: "36px", marginTop: "20px", marginBottom: "30px" }}>
        {language.name} — {language.script}
      </h1>

      {courses.length === 0 && (
        <p style={{ color: "#999" }}>Aucun cours disponible. <code>bun run db:seed</code></p>
      )}

      <div style={{ display: "grid", gap: "24px" }}>
        {courses.map((course) => {
          const chars = course.characters;
          const isLocked = lockedCourseIds.has(course.id);
          const mastered = masteredByCourse.get(course.id) ?? 0;
          const total = chars.length;
          const masteredPct = total > 0 ? Math.round((mastered / total) * 100) : 0;

          return (
            <div
              key={course.id}
              style={{
                border: `2px solid ${isLocked ? "#e5e7eb" : "#000"}`,
                padding: "20px",
                borderRadius: "8px",
                background: isLocked ? "#f9fafb" : "#fff",
                opacity: isLocked ? 0.7 : 1,
                position: "relative",
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div>
                  <h2 style={{ fontSize: "22px", margin: 0, color: isLocked ? "#9ca3af" : "#000" }}>
                    {isLocked ? "🔒 " : ""}{course.title}
                  </h2>
                  {course.description && (
                    <p style={{ fontSize: "13px", color: "#9ca3af", margin: "4px 0 0 0" }}>
                      {course.description}
                    </p>
                  )}
                </div>
                <div style={{ textAlign: "right", fontSize: "13px", color: "#6b7280", flexShrink: 0, marginLeft: "16px" }}>
                  <div>{chars.length} caractère{chars.length > 1 ? "s" : ""}</div>
                  {userId && !isLocked && total > 0 && (
                    <div style={{ marginTop: "4px", color: mastered === total ? "#16a34a" : "#6b7280" }}>
                      {mastered}/{total} maîtrisés ({masteredPct}%)
                    </div>
                  )}
                  {isLocked && (
                    <div style={{ marginTop: "4px", color: "#9ca3af", fontSize: "12px" }}>
                      Maîtrisez {Math.ceil(UNLOCK_THRESHOLD * 100)}% du cours précédent
                    </div>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              {userId && !isLocked && total > 0 && (
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", height: "6px", width: "100%", overflow: "hidden", borderRadius: "9999px", background: "#e5e7eb" }}>
                    <div style={{ width: `${masteredPct}%`, background: "#22c55e", height: "100%", transition: "width 0.3s" }} />
                  </div>
                </div>
              )}

              {/* Character grid */}
              {isLocked ? (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
                  gap: "12px",
                }}>
                  {chars.map((c) => {
                    const romaji = c.romaji ? (JSON.parse(c.romaji) as string[])[0] : null;
                    return (
                      <div
                        key={c.id}
                        style={{
                          border: "1px solid #e5e7eb",
                          padding: "16px 8px",
                          borderRadius: "8px",
                          textAlign: "center",
                          background: "#f3f4f6",
                          cursor: "not-allowed",
                        }}
                      >
                        <p style={{ fontSize: "34px", margin: 0, color: "#d1d5db" }}>{c.label}</p>
                        {romaji && <p style={{ fontSize: "11px", marginTop: "4px", color: "#d1d5db" }}>{romaji}</p>}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
                  gap: "12px",
                }}>
                  {chars.map((c) => {
                    const romaji = c.romaji ? (JSON.parse(c.romaji) as string[])[0] : null;
                    const level = progressByCharId.get(c.id) ?? -1;
                    // -1 = not started, 0 = started (full guide), 1 = dotted, 2 = mastered
                    const borderColor = level >= 2 ? "#22c55e" : level >= 0 ? "#facc15" : "#e5e7eb";
                    const bgColor = level >= 2 ? "#f0fdf4" : level >= 0 ? "#fefce8" : "#fff";

                    return (
                      <Link
                        key={c.id}
                        href={`/langue/${encodeURIComponent(lang)}/${encodeURIComponent(c.id)}/learn`}
                        style={{ textDecoration: "none" }}
                      >
                        <div style={{
                          border: `2px solid ${borderColor}`,
                          padding: "14px 8px",
                          borderRadius: "8px",
                          textAlign: "center",
                          cursor: "pointer",
                          background: bgColor,
                          position: "relative",
                        }}>
                          {level >= 2 && (
                            <span style={{
                              position: "absolute", top: "4px", right: "4px",
                              fontSize: "10px", color: "#16a34a",
                            }}>⭐</span>
                          )}
                          {level === 1 && (
                            <span style={{
                              position: "absolute", top: "4px", right: "4px",
                              fontSize: "10px", color: "#ca8a04",
                            }}>✏️</span>
                          )}
                          <p style={{ fontSize: "34px", margin: 0, color: "#000" }}>{c.label}</p>
                          {romaji && (
                            <p style={{ fontSize: "11px", marginTop: "4px", color: "#6b7280" }}>{romaji}</p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
