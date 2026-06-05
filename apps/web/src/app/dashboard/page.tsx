"use client";

import Link from "next/link";
import { useStats } from "../../hooks/useStats";
import { useRecentSessions } from "../../hooks/useSessions";
import { useUserLanguages } from "../../hooks/useUserLanguages";
import { useProgressByLang } from "../../hooks/useProgressByLang";
import { useCharacters } from "../../hooks/useCharacters";
import { useRevisionCount } from "../../hooks/useRevisionQueue";
import type { ActivityDay } from "../../hooks/useStats";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: sessions, isLoading: sessionsLoading } = useRecentSessions(5);
  const { active: languages, isLoading: langsLoading } = useUserLanguages();

  return (
    <main className="container mx-auto max-w-4xl px-4 py-5 space-y-5 pb-24 md:pb-10">
      <h1 className="text-xl font-bold md:text-2xl">Dashboard</h1>

      {/* Section 1 — Stats rapides */}
      <section>
        {statsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 h-20 animate-pulse" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Série" value={stats.streak} unit={stats.streak === 1 ? "jour" : "jours"} icon="🔥" highlight={stats.streak > 0} />
            <StatCard label="Sessions" value={stats.sessionCount} icon="🎯" />
            <StatCard label="Maîtrisés" value={stats.mastered} icon="✅" highlight />
            <RevisionStatCard />
          </div>
        ) : null}
      </section>

      {/* Section 2 — Activité 30 jours */}
      {stats && stats.sessionCount > 0 && stats.activityDays && (
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 md:p-5">
          <ActivityHeatmap days={stats.activityDays} streak={stats.streak} />
        </section>
      )}

      {/* Section 3 — Progression par langue */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Progression</h2>
        {langsLoading ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 h-32 animate-pulse" />
        ) : (
          languages.map((lang) => (
            <LanguageSection
              key={lang.languageId}
              langCode={lang.languageCode}
              langName={lang.name}
              script={lang.script}
            />
          ))
        )}
      </section>

      {/* Section 4 — Sessions récentes */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 md:p-5">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Sessions récentes</h2>
        {sessionsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : !sessions || sessions.items.length === 0 ? (
          <div className="text-center py-4 space-y-3">
            <p className="text-zinc-400 text-sm">Aucune session enregistrée.</p>
            <Link href="/langue" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Commencer à pratiquer →
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-800">
            {sessions.items.map((s) => {
              const durationMin = s.durationMs ? Math.round(s.durationMs / 60_000) : null;
              return (
                <li key={s.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <p className="font-medium">{s.languageName}</p>
                    <p className="text-zinc-500 text-xs mt-0.5">
                      {new Date(s.startedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                      {durationMin !== null && ` · ${durationMin} min`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <p className="text-zinc-500 text-[10px]">Chars</p>
                      <p className="font-semibold text-sm">{s.totalAttempts}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 text-[10px]">Score</p>
                      <p className={`font-semibold text-sm ${s.successRate >= 80 ? "text-green-400" : s.successRate >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                        {s.successRate}%
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}

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
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3.5 flex items-center gap-3">
      <span className="text-2xl shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className={`text-xl font-bold tabular-nums leading-none ${highlight ? "text-green-400" : "text-white"}`}>
          {value}
          {unit ? <span className="ml-1 text-xs font-normal text-zinc-400">{unit}</span> : null}
        </p>
        <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function RevisionStatCard() {
  const { data: count } = useRevisionCount();
  return (
    <Link
      href="/revision"
      className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3.5 flex items-center gap-3 hover:border-zinc-600 transition-colors"
    >
      <span className="text-2xl shrink-0">🔁</span>
      <div className="min-w-0">
        <p className={`text-xl font-bold tabular-nums leading-none ${(count ?? 0) > 0 ? "text-yellow-400" : "text-white"}`}>
          {count ?? 0}
        </p>
        <p className="text-xs text-zinc-500 mt-0.5">À réviser</p>
      </div>
    </Link>
  );
}

function ActivityHeatmap({ days, streak }: { days: ActivityDay[]; streak: number }) {
  if (!days.length) return null;

  const DAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];
  const activeCount = days.filter(d => d.active).length;

  // Pad to start on Monday
  const firstDay = new Date(days[0]!.day + "T12:00:00");
  const firstWeekday = (firstDay.getDay() + 6) % 7; // Mon=0, Sun=6

  const padded: (ActivityDay | null)[] = [...Array(firstWeekday).fill(null), ...days];
  const weeks: (ActivityDay | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    const week = padded.slice(i, i + 7);
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Activité — 30 jours</h2>
        <span className="text-xs text-zinc-500">{activeCount} / 30 actifs</span>
      </div>

      {/* Streak banner */}
      {streak > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-orange-950/60 border border-orange-800/50 px-3 py-2">
          <span className="text-base">🔥</span>
          <p className="text-sm font-semibold text-orange-300">
            {streak} jour{streak > 1 ? "s" : ""} de série !
          </p>
        </div>
      )}

      {/* Calendar grid */}
      <div className="space-y-1">
        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1">
          {DAY_LABELS.map((label, i) => (
            <div key={i} className="text-center text-zinc-600 text-[10px] font-semibold">{label}</div>
          ))}
        </div>
        {/* Week rows */}
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((day, di) => (
              <div
                key={di}
                title={day?.day ?? ""}
                className={`aspect-square rounded-md transition-colors ${
                  day === null
                    ? "opacity-0 pointer-events-none"
                    : day.active
                    ? "bg-green-500"
                    : "bg-zinc-800"
                }`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 pt-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-green-500" />
          <span className="text-[10px] text-zinc-500">Actif</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-zinc-800" />
          <span className="text-[10px] text-zinc-500">Inactif</span>
        </div>
      </div>
    </div>
  );
}

function LanguageSection({
  langCode,
  langName,
  script,
}: {
  langCode: string;
  langName: string;
  script: string | null;
}) {
  const { data: progress } = useProgressByLang(langCode);
  const { data: allChars } = useCharacters(langCode);
  const now = Date.now();

  if (!progress || !allChars) {
    return <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 h-24 animate-pulse" />;
  }

  const progressMap = new Map(progress.items.map((p) => [p.characterId, p]));
  const total = allChars.length;
  const mastered = progress.items.filter((p) => p.practiceLevel >= 5).length;
  const started = progress.items.filter((p) => p.practiceLevel > 0 && p.practiceLevel < 5).length;

  const masteredPct = total > 0 ? (mastered / total) * 100 : 0;
  const startedPct = total > 0 ? (started / total) * 100 : 0;
  const notStartedPct = Math.max(0, 100 - masteredPct - startedPct);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-semibold">{langName}</span>
          {script && <span className="ml-2 text-zinc-500 text-sm">{script}</span>}
        </div>
        <Link
          href={`/langue/${langCode}`}
          className="text-xs text-zinc-500 hover:text-white transition-colors shrink-0"
        >
          Voir →
        </Link>
      </div>

      {/* Progress bar */}
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-zinc-800">
        {masteredPct > 0 && <div className="bg-green-500 h-full transition-all" style={{ width: `${masteredPct}%` }} />}
        {startedPct > 0 && <div className="bg-yellow-400 h-full transition-all" style={{ width: `${startedPct}%` }} />}
        {notStartedPct > 0 && <div className="bg-zinc-700 h-full transition-all" style={{ width: `${notStartedPct}%` }} />}
      </div>

      {/* Stats legend */}
      <div className="flex items-center gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
          {mastered} maîtrisés
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />
          {started} en cours
        </span>
        <span className="text-zinc-600">{total - mastered - started} restants</span>
      </div>

      {/* Characters snapshot — due first, then started, capped at 20 */}
      {(() => {
        const dueChars = allChars.filter(c => {
          const p = progressMap.get(c.id);
          return p && new Date(p.nextReview).getTime() <= now && p.practiceLevel < 5;
        });
        const startedChars = allChars.filter(c => {
          const p = progressMap.get(c.id);
          return p && p.practiceLevel > 0 && p.practiceLevel < 5 && new Date(p.nextReview).getTime() > now;
        });
        const shown = [...dueChars, ...startedChars].slice(0, 20);
        const rest = dueChars.length + startedChars.length - shown.length;

        if (shown.length === 0) return null;
        return (
          <div>
            <p className="text-xs text-zinc-500 mb-1.5">
              {dueChars.length > 0 ? `${dueChars.length} à réviser` : "En cours"}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {shown.map((char) => {
                const p = progressMap.get(char.id);
                const isDue = p ? new Date(p.nextReview).getTime() <= now : false;
                return (
                  <Link
                    key={char.id}
                    href={`/langue/${langCode}/${encodeURIComponent(char.id)}/learn`}
                    title={char.romaji?.[0] ?? char.label}
                    className={[
                      "relative flex items-center justify-center w-9 h-9 rounded-lg text-sm font-bold border transition-colors active:scale-95",
                      isDue
                        ? "border-orange-600 bg-orange-950 text-orange-200"
                        : "border-yellow-700 bg-yellow-950 text-yellow-200",
                    ].join(" ")}
                  >
                    {char.label}
                    {isDue && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />}
                  </Link>
                );
              })}
              {rest > 0 && (
                <Link
                  href={`/langue/${langCode}`}
                  className="flex items-center justify-center w-9 h-9 rounded-lg text-xs font-medium border border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-500 transition-colors"
                >
                  +{rest}
                </Link>
              )}
            </div>
          </div>
        );
      })()}

      {(langCode === "ru-RU" || langCode === "ja-JP") && (
        <Link
          href={`/${langCode}/words/1`}
          className="flex items-center justify-between p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors"
        >
          <div>
            <p className="text-sm font-medium text-zinc-200">Mots</p>
            <p className="text-xs text-zinc-500">
              {langCode === "ru-RU" ? "Écriture cursive · Cours 1" : "Hiragana · Cours 1"}
            </p>
          </div>
          <span className="text-xs text-blue-400 font-medium">Pratiquer →</span>
        </Link>
      )}
    </div>
  );
}
