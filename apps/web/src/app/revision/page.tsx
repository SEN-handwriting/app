"use client";

import React, { useEffect, useRef, useState } from "react";
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
      setCompletedCount((c) => c + 1);
      setCurrentIndex((idx) => {
        const next = idx + 1;
        if (next >= data!.items.length) {
          setMode("summary");
        }
        return next >= data!.items.length ? idx : next;
      });
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
  const mobilePreviewRef = useRef<CharacterPreviewHandle | null>(null);
  const desktopPreviewRef = useRef<CharacterPreviewHandle | null>(null);
  const [showStrokes, setShowStrokes] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const REQUIRED_SUCCESSES = 2;

  useEffect(() => {
    if (character) {
      const t = setTimeout(() => {
        mobilePreviewRef.current?.replay();
        desktopPreviewRef.current?.replay();
      }, 50);
      return () => clearTimeout(t);
    }
  }, [character?.id]);

  if (isLoading || !character) {
    return <div className="text-zinc-400 py-10">Chargement du caractère…</div>;
  }

  return (
    <>
      {/* ── MOBILE layout ── */}
      <div className="md:hidden flex flex-col" style={{ height: "calc(100dvh - 12rem)" }}>
        <div className="flex-none border-b border-zinc-800 px-4 pt-2 pb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{character.label}</span>
              {character.romaji?.[0] && (
                <span className="text-sm text-zinc-500">{character.romaji[0]}</span>
              )}
            </div>
            <button
              onClick={() => setShowInfo(true)}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-zinc-700 text-zinc-400 hover:bg-zinc-800 transition-colors text-sm"
            >
              ℹ️
            </button>
          </div>

          <div className="flex justify-center">
            <CharacterPreview
              ref={mobilePreviewRef}
              character={character}
              showStrokes={showStrokes}
              size={110}
              showLabel={false}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2">
            <button
              onClick={() => setShowStrokes((s) => !s)}
              className="py-2.5 rounded-xl border border-zinc-700 text-xs hover:bg-zinc-800 transition-colors active:bg-zinc-700"
            >
              {showStrokes ? "Cacher" : "Traits"}
            </button>
            <button
              onClick={() => mobilePreviewRef.current?.replay()}
              className="py-2.5 rounded-xl border border-zinc-700 text-xs hover:bg-zinc-800 transition-colors active:bg-zinc-700"
            >
              Rejouer
            </button>
            <button
              onClick={() => mobilePreviewRef.current?.speak()}
              className="py-2.5 rounded-xl border border-zinc-700 text-xs hover:bg-zinc-800 transition-colors active:bg-zinc-700"
            >
              🔊 Son
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden flex flex-col px-4 py-3">
          <PracticeGrid
            character={character}
            initialLevel={1}
            onSuccess={() => {
              const next = successCount + 1;
              setSuccessCount(next);
              if (next >= REQUIRED_SUCCESSES) setSucceeded(true);
            }}
            fillHeight
          />
        </div>

        {succeeded && (
          <div className="flex-none flex items-center justify-between border-t border-green-800 bg-green-950 px-5 py-3">
            <span className="text-green-400 font-medium text-sm">✓ Révisé !</span>
            <button
              onClick={onAdvance}
              className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors font-medium text-sm"
            >
              Suivant →
            </button>
          </div>
        )}
      </div>

      {/* Info bottom sheet (mobile) */}
      {showInfo && (
        <div
          className="fixed inset-0 z-50 bg-black/60 md:hidden"
          onClick={() => setShowInfo(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-700 rounded-t-2xl px-5 pt-5 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-base">{character.label}</span>
              <button
                onClick={() => setShowInfo(false)}
                className="text-zinc-400 hover:text-white text-xl w-8 h-8 flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-sm">
              {character.meanings && (
                <div className="flex gap-3">
                  <span className="text-zinc-500 w-16 shrink-0">Sens</span>
                  <span className="text-zinc-200">{character.meanings.join(", ")}</span>
                </div>
              )}
              {character.readings?.kana && (
                <div className="flex gap-3">
                  <span className="text-zinc-500 w-16 shrink-0">Lecture</span>
                  <span className="text-zinc-200">{character.readings.kana.join(", ")}</span>
                </div>
              )}
              {character.jlpt && (
                <div className="flex gap-3">
                  <span className="text-zinc-500 w-16 shrink-0">JLPT</span>
                  <span className="text-zinc-200">{character.jlpt}</span>
                </div>
              )}
              {character.strokeCount && (
                <div className="flex gap-3">
                  <span className="text-zinc-500 w-16 shrink-0">Traits</span>
                  <span className="text-zinc-200">{character.strokeCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── DESKTOP layout ── */}
      <div className="hidden md:block">
        <div className="grid grid-cols-2 gap-12">
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-zinc-300">Modèle</h2>
            <CharacterPreview
              ref={desktopPreviewRef}
              character={character}
              showStrokes={showStrokes}
              showLabel={false}
            />

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setShowStrokes((s) => !s)}
                className="py-3 rounded-xl border border-zinc-700 text-sm hover:bg-zinc-800 transition-colors active:bg-zinc-700"
              >
                {showStrokes ? "Cacher" : "Traits"}
              </button>
              <button
                onClick={() => desktopPreviewRef.current?.replay()}
                className="py-3 rounded-xl border border-zinc-700 text-sm hover:bg-zinc-800 transition-colors active:bg-zinc-700"
              >
                Rejouer
              </button>
              <button
                onClick={() => desktopPreviewRef.current?.speak()}
                className="py-3 rounded-xl border border-zinc-700 text-sm hover:bg-zinc-800 transition-colors active:bg-zinc-700"
              >
                🔊
              </button>
            </div>

            {(character.meanings || character.readings?.kana || character.jlpt || character.strokeCount) && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-2 text-sm">
                {character.meanings && (
                  <div className="flex gap-2">
                    <span className="text-zinc-500 shrink-0">Sens</span>
                    <span className="text-zinc-200">{character.meanings.join(", ")}</span>
                  </div>
                )}
                {character.readings?.kana && (
                  <div className="flex gap-2">
                    <span className="text-zinc-500 shrink-0">Lecture</span>
                    <span className="text-zinc-200">{character.readings.kana.join(", ")}</span>
                  </div>
                )}
                {character.jlpt && (
                  <div className="flex gap-2">
                    <span className="text-zinc-500 shrink-0">JLPT</span>
                    <span className="text-zinc-200">{character.jlpt}</span>
                  </div>
                )}
                {character.strokeCount && (
                  <div className="flex gap-2">
                    <span className="text-zinc-500 shrink-0">Traits</span>
                    <span className="text-zinc-200">{character.strokeCount}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-semibold text-zinc-300">Zone de pratique</h2>
            <PracticeGrid
              character={character}
              initialLevel={1}
              onSuccess={() => {
                const next = successCount + 1;
                setSuccessCount(next);
                if (next >= REQUIRED_SUCCESSES) setSucceeded(true);
              }}
            />

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
        </div>
      </div>
    </>
  );
}
