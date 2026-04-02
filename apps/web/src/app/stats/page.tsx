import { db } from "@repo/database/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "../../lib/auth-session";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeStreak(sessions: { startedAt: Date }[]): number {
  if (sessions.length === 0) return 0;
  const days = new Set(sessions.map((s) => s.startedAt.toISOString().slice(0, 10)));
  let streak = 0;
  const d = new Date();
  while (days.has(d.toISOString().slice(0, 10))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function last30Days(): string[] {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().slice(0, 10);
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function StatsPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const userId = session.user.id;

  // Parallel queries
  const [
    progressCount,
    masteredCount,
    allSessions,
    languages,
    progressByLanguage,
  ] = await Promise.all([
    db.userProgress.count({ where: { userId } }),
    db.userProgress.count({ where: { userId, practiceLevel: 2 } }),
    db.practiceSession.findMany({
      where: { userId },
      orderBy: { startedAt: "desc" },
      include: { language: { select: { name: true } } },
    }),
    db.language.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: { _count: { select: { characters: true } } },
    }),
    db.userProgress.findMany({
      where: { userId },
      select: {
        practiceLevel: true,
        character: { select: { languageId: true } },
      },
    }),
  ]);

  const sessionCount = allSessions.length;
  const streak = computeStreak(allSessions);
  const days = last30Days();
  const activeDays = new Set(
    allSessions.map((s) => s.startedAt.toISOString().slice(0, 10)),
  );

  // Group progress by language
  const progressMap: Record<string, { started: number; mastered: number }> = {};
  for (const p of progressByLanguage) {
    const langId = p.character.languageId;
    if (!progressMap[langId]) progressMap[langId] = { started: 0, mastered: 0 };
    if (p.practiceLevel === 2) {
      progressMap[langId].mastered++;
    } else {
      progressMap[langId].started++;
    }
  }

  const recentSessions = allSessions
    .filter((s) => s.completedAt !== null)
    .slice(0, 5);

  // French day-of-week labels (Mon=1 … Sun=0)
  const DAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  return (
    <main className="container mx-auto max-w-4xl px-4 py-10 space-y-8">
      <h1 className="text-3xl font-bold">Mes statistiques</h1>

      {/* ── Summary cards ─────────────────────────────────────────────────── */}
      <section>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label="Caractères vus"
            value={progressCount}
            icon="👁"
          />
          <StatCard
            label="Maîtrisés"
            value={masteredCount}
            icon="✅"
            highlight
          />
          <StatCard label="Sessions" value={sessionCount} icon="🎯" />
          <StatCard
            label="Série"
            value={streak}
            unit={streak === 1 ? "jour" : "jours"}
            icon="🔥"
            highlight={streak > 0}
          />
        </div>
      </section>

      {/* ── Activity heatmap ──────────────────────────────────────────────── */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
        <h2 className="text-lg font-semibold">Activité (30 derniers jours)</h2>
        {sessionCount === 0 ? (
          <EmptyState
            message="Aucune session enregistrée pour l'instant."
            cta="Commencer à pratiquer"
            href="/langue"
          />
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[480px] space-y-2">
              <div className="grid grid-cols-[repeat(30,minmax(0,1fr))] gap-1">
                {days.map((day) => {
                  const active = activeDays.has(day);
                  return (
                    <div
                      key={day}
                      title={day}
                      className={`aspect-square rounded-sm ${
                        active
                          ? "bg-green-500 opacity-80"
                          : "bg-zinc-800"
                      }`}
                    />
                  );
                })}
              </div>
              <div className="grid grid-cols-[repeat(30,minmax(0,1fr))] gap-1">
                {days.map((day) => {
                  const d = new Date(day + "T12:00:00");
                  const dow = d.getDay();
                  const showLabel = dow === 1 || dow === 3 || dow === 5;
                  return (
                    <div
                      key={day}
                      className="text-center text-zinc-600"
                      style={{ fontSize: "9px" }}
                    >
                      {showLabel ? DAY_LABELS[dow] : ""}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Progress by language ──────────────────────────────────────────── */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
        <h2 className="text-lg font-semibold">Progression par langue</h2>
        {languages.length === 0 ? (
          <EmptyState
            message="Aucune langue disponible."
            cta="Voir les langues"
            href="/langue"
          />
        ) : (
          <ul className="space-y-4">
            {languages.map((lang) => {
              const total = lang._count.characters;
              const prog = progressMap[lang.id] ?? { started: 0, mastered: 0 };
              const notStarted = Math.max(0, total - prog.started - prog.mastered);
              const masteredPct = total > 0 ? (prog.mastered / total) * 100 : 0;
              const startedPct = total > 0 ? (prog.started / total) * 100 : 0;
              const notStartedPct = total > 0 ? (notStarted / total) * 100 : 100;

              return (
                <li key={lang.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {lang.name}
                      {lang.script ? (
                        <span className="ml-2 text-zinc-400 font-normal">
                          {lang.script}
                        </span>
                      ) : null}
                    </span>
                    <span className="text-zinc-400 text-xs">
                      {prog.mastered}/{total} maîtrisés
                    </span>
                  </div>
                  <div className="flex h-3 w-full overflow-hidden rounded-full bg-zinc-800">
                    {masteredPct > 0 && (
                      <div
                        className="bg-green-500 h-full transition-all"
                        style={{ width: `${masteredPct}%` }}
                      />
                    )}
                    {startedPct > 0 && (
                      <div
                        className="bg-yellow-400 h-full transition-all"
                        style={{ width: `${startedPct}%` }}
                      />
                    )}
                    {notStartedPct > 0 && (
                      <div
                        className="bg-zinc-700 h-full transition-all"
                        style={{ width: `${notStartedPct}%` }}
                      />
                    )}
                  </div>
                  <div className="flex gap-4 text-xs text-zinc-500">
                    <span>
                      <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1" />
                      Maîtrisés ({prog.mastered})
                    </span>
                    <span>
                      <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 mr-1" />
                      En cours ({prog.started})
                    </span>
                    <span>
                      <span className="inline-block w-2 h-2 rounded-full bg-zinc-700 mr-1" />
                      Non commencés ({notStarted})
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ── Recent sessions ───────────────────────────────────────────────── */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
        <h2 className="text-lg font-semibold">Sessions récentes</h2>
        {recentSessions.length === 0 ? (
          <EmptyState
            message="Aucune session terminée pour l'instant."
            cta="Commencer une session"
            href="/langue"
          />
        ) : (
          <ul className="divide-y divide-zinc-800">
            {recentSessions.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-3 text-sm">
                <div className="space-y-0.5">
                  <p className="font-medium">{s.language.name}</p>
                  <p className="text-zinc-400 text-xs">
                    {s.startedAt.toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <p className="text-zinc-400 text-xs">Caractères</p>
                    <p className="font-medium">{s.totalChars}</p>
                  </div>
                  <div>
                    <p className="text-zinc-400 text-xs">Score</p>
                    <p className="font-medium">
                      {s.score !== null && s.score !== undefined
                        ? `${Math.round(s.score)}%`
                        : "—"}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  unit,
  icon,
  highlight,
}: {
  label: string;
  value: number;
  unit?: string;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-2">
      <p className="text-2xl">{icon}</p>
      <p
        className={`text-3xl font-bold tabular-nums ${
          highlight ? "text-green-400" : "text-white"
        }`}
      >
        {value}
        {unit ? (
          <span className="ml-1 text-sm font-normal text-zinc-400">{unit}</span>
        ) : null}
      </p>
      <p className="text-sm text-zinc-400">{label}</p>
    </div>
  );
}

function EmptyState({
  message,
  cta,
  href,
}: {
  message: string;
  cta: string;
  href: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center">
      <p className="text-zinc-400 text-sm">{message}</p>
      <Link
        href={href}
        className="inline-flex items-center rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
      >
        {cta} →
      </Link>
    </div>
  );
}
