"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useRevisionQueue } from "../../hooks/useRevisionQueue";
import { useCharacter } from "../../hooks/useCharacters";
import { RevisionQueue } from "../../components/RevisionQueue";
import CharacterPreview, {
  type CharacterPreviewHandle,
} from "../../components/CharacterPreview";
import PracticeGrid from "../../components/PracticeGrid";
import type { RevisionItem } from "../api/revision/route";

type RevisionMode = "list" | "practice" | "summary";

export default function RevisionPage() {
  const { data, isLoading, isError } = useRevisionQueue();
  const [mode, setMode] = useState<RevisionMode>("list");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  if (isLoading) {
    return (
      <main className="container mx-auto max-w-2xl px-4 py-10 pb-24 md:pb-10">
        <p className="text-zinc-400">Chargement des révisions…</p>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="container mx-auto max-w-2xl px-4 py-10 pb-24 md:pb-10">
        <p className="text-red-400">Erreur lors du chargement des révisions.</p>
      </main>
    );
  }

  if (mode === "summary") {
    return (
      <main className="container mx-auto max-w-2xl px-4 py-10 pb-24 md:pb-10 space-y-6 text-center">
        <div className="text-5xl">🎉</div>
        <h1 className="text-2xl font-bold">Session terminée !</h1>
        <p className="text-zinc-400">
          {completedCount} caractère{completedCount > 1 ? "s" : ""} révisé{completedCount > 1 ? "s" : ""}
        </p>
        <Link
          href="/dashboard"
          className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-zinc-800 px-6 py-3 font-medium hover:bg-zinc-700 transition-colors"
        >
          Retour au dashboard
        </Link>
      </main>
    );
  }

  if (mode === "practice" && data.items.length > 0) {
    const currentItem = data.items[currentIndex]!;

    function handleAdvance() {
      const next = currentIndex + 1;
      setCompletedCount((c) => c + 1);
      if (next >= data!.items.length) {
        setMode("summary");
      } else {
        setCurrentIndex(next);
      }
    }

    return (
      <main className="container mx-auto max-w-5xl px-4 py-6 pb-24 md:pb-10 space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setMode("list")}
            className="text-zinc-400 hover:text-white text-sm transition-colors py-2 pr-4"
          >
            ← Liste
          </button>
          <div className="flex-1 mx-4">
            <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className="bg-green-500 h-full transition-all"
                style={{ width: `${(completedCount / data.items.length) * 100}%` }}
              />
            </div>
            <p className="text-xs text-zinc-400 text-center mt-1">
              {completedCount} / {data.items.length}
            </p>
          </div>
        </div>

        <PracticeCharacter
          key={currentItem.characterId}
          item={currentItem}
          onAdvance={handleAdvance}
        />
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-2xl px-4 py-6 pb-24 md:pb-10 space-y-6">
      <Link href="/langue" className="inline-flex items-center text-zinc-400 hover:text-white text-sm transition-colors py-1">
        ← Langues
      </Link>
      <h1 className="text-2xl font-bold">Révisions</h1>

      {data.total === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center space-y-3">
          <p className="text-4xl">🎉</p>
          <p className="text-lg font-semibold">Aucune révision due</p>
          <p className="text-zinc-400 text-sm">Reviens demain !</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl bg-zinc-800 px-5 py-2.5 text-sm font-medium hover:bg-zinc-700 transition-colors"
          >
            Retour au dashboard
          </Link>
        </div>
      ) : (
        <RevisionQueue
          items={data.items}
          onStart={() => {
            setCurrentIndex(0);
            setCompletedCount(0);
            setMode("practice");
          }}
        />
      )}
    </main>
  );
}

function PracticeCharacter({
  item,
  onAdvance,
}: {
  item: RevisionItem;
  onAdvance: () => void;
}) {
  const { data: character, isLoading } = useCharacter(item.characterId);
  const previewRef = useRef<CharacterPreviewHandle | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  if (isLoading || !character) {
    return <div className="text-zinc-400 py-10">Chargement du caractère…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">Modèle</h2>
          <CharacterPreview ref={previewRef} character={character} showStrokes />
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => previewRef.current?.replay()}
              className="flex-1 py-3 rounded-xl border border-zinc-700 text-sm hover:bg-zinc-800 transition-colors"
            >
              Rejouer
            </button>
            <button
              onClick={() => previewRef.current?.speak()}
              className="flex-1 py-3 rounded-xl border border-zinc-700 text-sm hover:bg-zinc-800 transition-colors"
            >
              🔊 Écouter
            </button>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-3">Tracé</h2>
          <PracticeGrid
            character={character}
            onSuccess={() => setSucceeded(true)}
          />
        </div>
      </div>

      {succeeded && (
        <div className="flex items-center justify-between rounded-xl border border-green-800 bg-green-950 px-5 py-4">
          <span className="text-green-400 font-medium">✓ Révisé !</span>
          <button
            onClick={onAdvance}
            className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors font-medium text-sm"
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
}
