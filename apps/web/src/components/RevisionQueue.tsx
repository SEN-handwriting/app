"use client";

import type { RevisionItem } from "../app/api/revision/route";
import { Button } from "@repo/ui/components/button";

interface RevisionQueueProps {
  items: RevisionItem[];
  onStart: () => void;
}

export function RevisionQueue({ items, onStart }: RevisionQueueProps) {
  const grouped = items.reduce<Record<string, RevisionItem[]>>((acc, item) => {
    const lang = item.character.languageCode;
    if (!acc[lang]) acc[lang] = [];
    acc[lang]!.push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-zinc-400">
          {items.length} caractère{items.length > 1 ? "s" : ""} à réviser
        </p>
        <Button color="secondary" onClick={onStart}>
          Commencer la révision →
        </Button>
      </div>

      {Object.entries(grouped).map(([lang, langItems]) => (
        <section
          key={lang}
          className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-3"
        >
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">{lang}</h2>
          <div className="flex flex-wrap gap-2">
            {langItems.map((item) => {
              const overdueDays = Math.floor(
                (Date.now() - new Date(item.nextReview).getTime()) / 86_400_000,
              );
              return (
                <div
                  key={item.characterId}
                  className="flex flex-col items-center rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm"
                  title={item.character.romaji[0] ?? ""}
                >
                  <span className="text-xl font-bold">{item.character.label}</span>
                  {overdueDays > 0 && (
                    <span className="text-xs text-red-400 mt-0.5">+{overdueDays}j</span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
