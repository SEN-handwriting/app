"use client";

import Link from "next/link";
import { useStats } from "../../hooks/useStats";
import { useRecentSessions } from "../../hooks/useSessions";
import { useLanguages, useProgressByLang } from "../../hooks/useProgressByLang";
import { useCharacters } from "../../hooks/useCharacters";
import { useRevisionCount } from "../../hooks/useRevisionQueue";
import type { ActivityDay } from "../../hooks/useStats";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: sessions, isLoading: sessionsLoading } = useRecentSessions(5);
  const { data: languages, isLoading: langsLoading } = useLanguages();

  return (
    <main className="container mx-auto max-w-4xl px-4 py-6 space-y-8 pb-24 md:pb-10">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Section 1 — Stats rapides */}
      <section>
        {statsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 h-24 animate-pulse" />
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
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
          <h2 className="text-base font-semibold text-zinc-300">Activité (30 jours)</h2>
          <Heatmap days={stats.activityDays} />
        </section>
      )}

      {/* Section 3 — Progression par langue */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-zinc-300">Progression par langue</h2>
        {langsLoading ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 h-40 animate-pulse" />
        ) : (
          languages?.map((lang) => (
            <LanguageSection
              key={lang.id}
              langCode={lang.code}
              langName={lang.name}
              script={lang.script}
            />
          ))
        )}
      </section>

      {/* Section 4 — Sessions récentes */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
        <h2 className="text-base font-semibold text-zinc-300">Sessions récentes</h2>
        {sessionsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-zinc-800 animate-pulse" />
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
                <li key={s.id} className="flex items-center justify-between py-3 text-sm">
                  <div className="space-y-0.5">
                    <p className="font-medium">{s.languageName}</p>
                    <p className="text-zinc-400 text-xs">
                      {new Date(s.startedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                      {durationMin !== null && ` · ${durationMin} min`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-zinc-400 text-xs">Chars</p>
                      <p className="font-medium">{s.totalAttempts}</p>
                    </div>
                    <div>
                      <p className="text-zinc-400 text-xs">Score</p>
                      <p className="font-medium">{s.successRate}%</p>
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
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-1">
      <p className="text-xl">{icon}</p>
      <p className={`text-2xl font-bold tabular-nums ${highlight ? "text-green-400" : "text-white"}`}>
        {value}
        {unit ? <span className="ml-1 text-xs font-normal text-zinc-400">{unit}</span> : null}
      </p>
      <p className="text-xs text-zinc-400">{label}</p>
    </div>
  );
}

function RevisionStatCard() {
  const { data: count } = useRevisionCount();
  return (
    <Link
      href="/revision"
      className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-1 hover:border-zinc-600 transition-colors block"
    >
      <p className="text-xl">🔁</p>
      <p className={`text-2xl font-bold tabular-nums ${(count ?? 0) > 0 ? "text-yellow-400" : "text-white"}`}>
        {count ?? 0}
      </p>
      <p className="text-xs text-zinc-400">À réviser</p>
    </Link>
  );
}

function Heatmap({ days }: { days: ActivityDay[] }) {
  const DAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[320px] space-y-1">
        <div className="grid grid-cols-[repeat(30,minmax(0,1fr))] gap-1">
          {days.map(({ day, active }) => (
            <div
              key={day}
              title={day}
              className={`aspect-square rounded-sm ${active ? "bg-green-500 opacity-80" : "bg-zinc-800"}`}
            />
          ))}
        </div>
        <div className="grid grid-cols-[repeat(30,minmax(0,1fr))] gap-1">
          {days.map(({ day }) => {
            const dow = new Date(day + "T12:00:00").getDay();
            const show = dow === 1 || dow === 3 || dow === 5;
            return (
              <div key={day} className="text-center text-zinc-600" style={{ fontSize: "8px" }}>
                {show ? DAY_LABELS[dow] : ""}
              </div>
            );
          })}
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
    return <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 h-24 animate-pulse" />;
  }

  const progressMap = new Map(progress.items.map((p) => [p.characterId, p]));
  const total = allChars.length;
  const mastered = progress.items.filter((p) => p.practiceLevel >= 5).length;
  const started = progress.items.filter((p) => p.practiceLevel > 0 && p.practiceLevel < 5).length;

  const masteredPct = total > 0 ? (mastered / total) * 100 : 0;
  const startedPct = total > 0 ? (started / total) * 100 : 0;
  const notStartedPct = Math.max(0, 100 - masteredPct - startedPct);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-medium">{langName}</span>
          {script && <span className="ml-2 text-zinc-400 text-sm">{script}</span>}
        </div>
        <Link
          href={`/langue/${langCode}`}
          className="text-xs text-zinc-400 hover:text-white transition-colors"
        >
          Voir les cours →
        </Link>
      </div>

      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
        {masteredPct > 0 && <div className="bg-green-500 h-full transition-all" style={{ width: `${masteredPct}%` }} />}
        {startedPct > 0 && <div className="bg-yellow-400 h-full transition-all" style={{ width: `${startedPct}%` }} />}
        {notStartedPct > 0 && <div className="bg-zinc-700 h-full transition-all" style={{ width: `${notStartedPct}%` }} />}
      </div>

      <div className="flex gap-3 text-xs text-zinc-500">
        <span><span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1" />{mastered} maîtrisés</span>
        <span><span className="inline-block w-2 h-2 rounded-full bg-yellow-400 mr-1" />{started} en cours</span>
        <span className="text-zinc-600">{total - mastered - started} restants</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {allChars.map((char) => {
          const prog = progressMap.get(char.id);
          const level = prog?.practiceLevel ?? 0;
          const isDue = prog ? new Date(prog.nextReview).getTime() <= now : false;
          const isMastered = level >= 5;
          const isStarted = level > 0 && level < 5;

          return (
            <Link
              key={char.id}
              href={`/langue/${langCode}/${encodeURIComponent(char.id)}/learn`}
              title={`${char.label}${char.romaji?.[0] ? ` (${char.romaji[0]})` : ""} — Niveau ${level}`}
              className={[
                "relative flex items-center justify-center w-9 h-9 rounded-lg text-sm font-bold border transition-colors",
                isMastered
                  ? "border-green-600 bg-green-950 text-green-300"
                  : isStarted
                  ? "border-yellow-700 bg-yellow-950 text-yellow-200"
                  : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-500",
              ].join(" ")}
            >
              {char.label}
              {isDue && !isMastered && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
              )}
            </Link>
          );
        })}
      </div>

      {(langCode === "ru-RU" || langCode === "ja-JP") && (
        <Link
          href={`/${langCode}/words/1`}
          className="flex items-center justify-between p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors mt-2"
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
