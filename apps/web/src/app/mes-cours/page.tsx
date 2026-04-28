import { db } from "@repo/database/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "../../lib/auth-session";

export default async function MesCoursPage() {
  const session = await getSession();
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

  const progressByCourse: Record<string, { started: number; mastered: number }> = {};
  for (const p of progress) {
    const cid = p.character.courseId ?? "";
    if (!cid) continue;
    if (!progressByCourse[cid]) progressByCourse[cid] = { started: 0, mastered: 0 };
    if (p.practiceLevel >= 5) progressByCourse[cid].mastered++;
    else if (p.practiceLevel > 0) progressByCourse[cid].started++;
  }

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
    <main className="container mx-auto max-w-3xl px-4 py-6 pb-24 md:pb-10 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Mes cours</h1>
        <Link
          href="/langue"
          className="shrink-0 rounded-xl bg-zinc-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          + Ajouter
        </Link>
      </div>

      {enrollments.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-10 text-center space-y-4">
          <p className="text-4xl">📚</p>
          <p className="text-zinc-400">Tu n&apos;es inscrit à aucun cours.</p>
          <Link
            href="/langue"
            className="inline-flex items-center rounded-xl bg-zinc-800 px-5 py-3 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
          >
            Choisir une langue →
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(byLanguage).map(([langId, { name, code, script, courses }]) => (
            <section key={langId} className="space-y-3">
              <h2 className="text-base font-semibold text-zinc-300">
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
                      className="block rounded-xl border border-zinc-800 bg-zinc-900 p-5 hover:border-zinc-600 transition-colors active:bg-zinc-800"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{course.title}</p>
                          {course.description && (
                            <p className="text-sm text-zinc-500 mt-0.5 truncate">{course.description}</p>
                          )}
                        </div>
                        <span className="shrink-0 text-xs text-zinc-500 text-right">
                          {prog.mastered}/{total}
                          <br />
                          <span className="text-green-400">maîtrisés</span>
                        </span>
                      </div>

                      <div className="flex h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                        {masteredPct > 0 && (
                          <div className="bg-green-500 h-full transition-all" style={{ width: `${masteredPct}%` }} />
                        )}
                        {startedPct > 0 && (
                          <div className="bg-yellow-400 h-full transition-all" style={{ width: `${startedPct}%` }} />
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
