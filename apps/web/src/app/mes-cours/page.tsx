import { auth } from "@repo/auth/server";
import { db } from "@repo/database/client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function MesCoursPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const userId = session.user.id;

  const enrollments = await db.userCourse.findMany({
    where: { userId },
    orderBy: { enrolledAt: "desc" },
    include: {
      course: {
        include: {
          language: { select: { id: true, name: true, code: true, script: true } },
          characters: { select: { id: true } },
        },
      },
    },
  });

  // Fetch progress for all characters in enrolled courses
  const enrolledCourseIds = enrollments.map((e) => e.courseId);
  const progress = enrolledCourseIds.length
    ? await db.userProgress.findMany({
        where: {
          userId,
          character: { courseId: { in: enrolledCourseIds } },
        },
        select: {
          practiceLevel: true,
          character: { select: { courseId: true } },
        },
      })
    : [];

  // Build progress map per course
  const progressByCourse: Record<string, { started: number; mastered: number }> = {};
  for (const p of progress) {
    const cid = p.character.courseId ?? "";
    if (!cid) continue;
    if (!progressByCourse[cid]) progressByCourse[cid] = { started: 0, mastered: 0 };
    if (p.practiceLevel === 2) progressByCourse[cid].mastered++;
    else progressByCourse[cid].started++;
  }

  // Group enrollments by language
  const byLanguage: Record<
    string,
    { name: string; code: string; script: string | null; courses: typeof enrollments }
  > = {};
  for (const e of enrollments) {
    const { id, name, code, script } = e.course.language;
    if (!byLanguage[id]) byLanguage[id] = { name, code, script, courses: [] };
    byLanguage[id].courses.push(e);
  }

  return (
    <main className="container mx-auto max-w-3xl px-4 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mes cours</h1>
        <Link
          href="/langue"
          className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          + Ajouter des cours
        </Link>
      </div>

      {enrollments.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-12 text-center space-y-4">
          <p className="text-zinc-400">Tu n'es inscrit à aucun cours pour l'instant.</p>
          <Link
            href="/langue"
            className="inline-flex items-center rounded-lg bg-zinc-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
          >
            Choisir une langue →
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(byLanguage).map(([langId, { name, code, script, courses }]) => (
            <section key={langId} className="space-y-3">
              <h2 className="text-lg font-semibold text-zinc-300">
                {name}
                {script && <span className="ml-2 text-sm font-normal text-zinc-500">{script}</span>}
              </h2>

              <div className="grid gap-3">
                {courses.map(({ course, enrolledAt }) => {
                  const total = course.characters.length;
                  const prog = progressByCourse[course.id] ?? { started: 0, mastered: 0 };
                  const masteredPct = total > 0 ? (prog.mastered / total) * 100 : 0;
                  const startedPct = total > 0 ? (prog.started / total) * 100 : 0;

                  return (
                    <Link
                      key={course.id}
                      href={`/langue/${encodeURIComponent(code)}`}
                      className="block rounded-xl border border-zinc-800 bg-zinc-900 p-5 hover:border-zinc-600 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <p className="font-medium">{course.title}</p>
                          {course.description && (
                            <p className="text-sm text-zinc-500 mt-0.5">{course.description}</p>
                          )}
                        </div>
                        <span className="shrink-0 text-xs text-zinc-500">
                          {prog.mastered}/{total} maîtrisés
                        </span>
                      </div>

                      <div className="flex h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                        {masteredPct > 0 && (
                          <div className="bg-green-500 h-full" style={{ width: `${masteredPct}%` }} />
                        )}
                        {startedPct > 0 && (
                          <div className="bg-yellow-400 h-full" style={{ width: `${startedPct}%` }} />
                        )}
                      </div>

                      <p className="text-xs text-zinc-600 mt-2">
                        Inscrit le{" "}
                        {new Date(enrolledAt).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "long",
                        })}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
