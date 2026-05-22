"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import DrawCanvas, { DrawCanvasHandle } from "./DrawCanvas";
import type { Character } from "../data/characters";
import { validateCharacter, buildWaypoints, getRealtimeStatus, shouldAdvanceGate } from "../lib/stroke-validator";
import type { LevelConfig } from "../lib/stroke-validator";
import { cn } from "@repo/ui/lib/utils";

const LEVEL_CONFIG: Array<LevelConfig & {
  guide: "full-thick" | "full" | "dotted-dense" | "dotted" | "dots" | undefined;
  label: string;
  step: string;
}> = [
  { guide: "full-thick",   waypointN: 8,  tolerancePx: 60, validThreshold: 0.45, label: "Étape 1", step: "Suis le tracé épais" },
  { guide: "full",         waypointN: 8,  tolerancePx: 50, validThreshold: 0.50, label: "Étape 2", step: "Tracé visible" },
  { guide: "dotted-dense", waypointN: 8,  tolerancePx: 40, validThreshold: 0.53, label: "Étape 3", step: "Pointillés denses" },
  { guide: "dotted",       waypointN: 9,  tolerancePx: 32, validThreshold: 0.56, label: "Étape 4", step: "Pointillés épars" },
  { guide: "dots",         waypointN: 9,  tolerancePx: 26, validThreshold: 0.60, label: "Étape 5", step: "Quelques repères" },
  { guide: undefined,      waypointN: 10, tolerancePx: 22, validThreshold: 0.63, label: "Étape 6", step: "De mémoire 🎯" },
];

interface PracticeGridProps {
  character: Character;
  onSuccess?: () => void;
  canvasClassName?: string;
  /** When true, adapts to fill parent height without scrolling (mobile learn page) */
  fillHeight?: boolean;
}

interface Toast {
  message: string;
  score: number;
  isValid: boolean;
  id: number;
}

export default function PracticeGrid({ character, onSuccess, canvasClassName, fillHeight }: PracticeGridProps) {
  const [practiceLevel, setPracticeLevel] = useState(0);
  const [isLoadingLevel, setIsLoadingLevel] = useState(true);
  const [currentStrokes, setCurrentStrokes] = useState<Array<Array<{ x: number; y: number }>>>([]);
  const [validationFeedback, setValidationFeedback] = useState<{ isValid: boolean; score: number } | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [justMastered, setJustMastered] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canvasRef = useRef<DrawCanvasHandle | null>(null);

  // fillHeight mode: callback ref so we re-observe whenever the div mounts/unmounts
  // (a plain useRef + useEffect misses the mount that happens after isLoadingLevel → false)
  const [canvasAreaEl, setCanvasAreaEl] = useState<HTMLDivElement | null>(null);
  const [canvasAreaSize, setCanvasAreaSize] = useState(0);
  useEffect(() => {
    if (!fillHeight || !canvasAreaEl) return;
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (!rect) return;
      const size = Math.min(Math.floor(rect.width), Math.floor(rect.height));
      if (size > 0) setCanvasAreaSize(size);
    });
    ro.observe(canvasAreaEl);
    return () => ro.disconnect();
  }, [fillHeight, canvasAreaEl]);

  const gateIndexRef = useRef(0);
  const currentStrokeIdxRef = useRef(0);
  const waypointsPerStrokeRef = useRef<Array<Array<{ x: number; y: number }>>>([]);
  const practiceLevelRef = useRef(0);
  const isRestartModeRef = useRef(false);

  useEffect(() => { practiceLevelRef.current = practiceLevel; }, [practiceLevel]);

  useEffect(() => {
    const config = LEVEL_CONFIG[Math.min(practiceLevel, LEVEL_CONFIG.length - 1)]!;
    waypointsPerStrokeRef.current = character.svgPaths.map(path =>
      buildWaypoints(path, config.waypointN, 300),
    );
    gateIndexRef.current = 0;
    currentStrokeIdxRef.current = 0;
  }, [character, practiceLevel]);

  useEffect(() => {
    setIsLoadingLevel(true);
    setCurrentStrokes([]);
    setValidationFeedback(null);
    setIsCorrect(false);
    setJustMastered(false);
    setToast(null);
    isRestartModeRef.current = false;
    canvasRef.current?.clear();

    fetch(`/api/progress?characterId=${encodeURIComponent(character.id)}`)
      .then(r => r.json())
      .then((data: { practiceLevel: number }) => {
        setPracticeLevel(data.practiceLevel ?? 0);
      })
      .catch(() => setPracticeLevel(0))
      .finally(() => setIsLoadingLevel(false));
  }, [character.id]);

  const showToast = useCallback((message: string, score: number, isValid: boolean) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, score, isValid, id: Date.now() });
    toastTimerRef.current = setTimeout(
      () => setToast(null),
      isValid ? 1400 : 3000,
    );
  }, []);

  const onStrokeStart = useCallback((completedCount: number) => {
    currentStrokeIdxRef.current = completedCount;
    gateIndexRef.current = 0;
  }, []);

  const onRealtimeFeedback = useCallback(
    (point: { x: number; y: number }): "on" | "near" | "off" => {
      const config = LEVEL_CONFIG[Math.min(practiceLevelRef.current, LEVEL_CONFIG.length - 1)]!;
      const waypoints = waypointsPerStrokeRef.current[currentStrokeIdxRef.current] ?? [];
      if (shouldAdvanceGate(point, waypoints, gateIndexRef.current, config.tolerancePx)) {
        gateIndexRef.current += 1;
      }
      return getRealtimeStatus(point, waypoints, gateIndexRef.current, config.tolerancePx);
    },
    [],
  );

  const handleStrokeComplete = useCallback(
    (strokes: Array<Array<{ x: number; y: number }>>) => {
      setCurrentStrokes(strokes);
      setValidationFeedback(null);

      if (strokes.length !== character.svgPaths.length) return;

      const config = LEVEL_CONFIG[Math.min(practiceLevelRef.current, LEVEL_CONFIG.length - 1)]!;
      const result = validateCharacter(strokes, character.svgPaths, {
        debug: process.env.NODE_ENV === "development",
        levelConfig: {
          waypointN: config.waypointN,
          tolerancePx: config.tolerancePx,
          validThreshold: config.validThreshold,
        },
      });

      setValidationFeedback({ isValid: result.isValid, score: result.score });
      setIsCorrect(result.isValid);
      showToast(result.feedback, result.score, result.isValid);

      const apiCall = fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId: character.id, score: result.score, isSuccess: result.isValid }),
      })
        .then(r => (r.ok ? (r.json() as Promise<{ practiceLevel: number; mastered: boolean }>) : null))
        .catch(() => null);

      if (result.isValid) {
        const levelAtAttempt = practiceLevelRef.current;
        setTimeout(async () => {
          const data = await apiCall;
          const nextLevel = isRestartModeRef.current
            ? Math.min(LEVEL_CONFIG.length - 1, levelAtAttempt + 1)
            : (data?.practiceLevel ?? Math.min(LEVEL_CONFIG.length - 1, levelAtAttempt + 1));
          if (nextLevel >= LEVEL_CONFIG.length - 1) isRestartModeRef.current = false;
          const justGotMastered = nextLevel >= 5 && levelAtAttempt < 5;
          if (justGotMastered) setJustMastered(true);
          setPracticeLevel(nextLevel);
          setCurrentStrokes([]);
          setValidationFeedback(null);
          setIsCorrect(false);
          gateIndexRef.current = 0;
          currentStrokeIdxRef.current = 0;
          canvasRef.current?.clear();
          onSuccess?.();
        }, 1500);
      }
    },
    [character, showToast],
  );

  const handleClear = useCallback(() => {
    canvasRef.current?.clear();
    setCurrentStrokes([]);
    setIsCorrect(false);
    setValidationFeedback(null);
    gateIndexRef.current = 0;
    currentStrokeIdxRef.current = 0;
  }, []);

  const handleReset = useCallback(() => {
    setPracticeLevel(0);
    setJustMastered(false);
    setCurrentStrokes([]);
    setIsCorrect(false);
    setValidationFeedback(null);
    gateIndexRef.current = 0;
    currentStrokeIdxRef.current = 0;
    canvasRef.current?.clear();
  }, []);

  if (isLoadingLevel) {
    return <div className="px-5 py-4 text-sm text-zinc-500">Chargement de votre progression…</div>;
  }

  const config = LEVEL_CONFIG[Math.min(practiceLevel, LEVEL_CONFIG.length - 1)]!;
  const isMastered = practiceLevel >= 5;

  const canvasBorderColor =
    isCorrect ? "#22c55e"
    : validationFeedback && !validationFeedback.isValid ? "#ef4444"
    : currentStrokes.length > 0 ? "#3b82f6"
    : "#ddd";

  const overlays = (
    <>
      {isCorrect && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-green-500/95 text-white flex items-center justify-center text-5xl font-bold pointer-events-none" style={{ animation: "popIn 0.3s ease-out" }}>✓</div>
      )}
      {validationFeedback && !validationFeedback.isValid && currentStrokes.length === character.svgPaths.length && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-red-500/95 text-white flex items-center justify-center text-5xl font-bold pointer-events-none" style={{ animation: "popIn 0.3s ease-out" }}>✗</div>
      )}
      {currentStrokes.length > 0 && (
        <div className="absolute bottom-3 right-3 bg-black/80 text-white px-3 py-1.5 rounded-md text-sm font-bold pointer-events-none">
          {currentStrokes.length}/{character.strokeCount}
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Toast — fixed at top of screen */}
      {toast && (
        <div
          key={toast.id}
          className={`fixed top-4 left-4 right-4 z-[60] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-sm pointer-events-none ${
            toast.isValid
              ? "bg-green-950 border-green-500 text-green-100"
              : "bg-red-950 border-red-500 text-red-100"
          }`}
          style={{ animation: "toastSlide 0.3s ease-out" }}
        >
          <span className={`text-2xl w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 ${toast.isValid ? "bg-green-500" : "bg-red-500"}`}>
            {toast.isValid ? "✓" : "✗"}
          </span>
          <div className="min-w-0">
            <p className="font-bold leading-tight">{toast.message}</p>
            <p className="text-xs opacity-60 mt-0.5">Score : {Math.round(toast.score)}/100</p>
          </div>
        </div>
      )}

      {/* Reset confirmation */}
      {showResetConfirm && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center"
          onClick={() => setShowResetConfirm(false)}
        >
          <div
            className="bg-zinc-900 border border-zinc-700 rounded-t-2xl px-5 pt-5 pb-10 w-full max-w-sm"
            onClick={e => e.stopPropagation()}
          >
            <p className="font-semibold text-base mb-1">Retour à l'étape 1 ?</p>
            <p className="text-sm text-zinc-400 mb-5">Ta progression en base est conservée.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 h-11 rounded-xl bg-zinc-800 text-zinc-300 text-sm font-semibold active:bg-zinc-700"
              >
                Annuler
              </button>
              <button
                onClick={() => { setShowResetConfirm(false); handleReset(); }}
                className="flex-1 h-11 rounded-xl bg-red-500 hover:bg-red-600 active:bg-red-700 text-white text-sm font-bold"
              >
                🗑️ Effacer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={fillHeight ? "w-full h-full flex flex-col gap-2" : "w-full space-y-3"}>
        {justMastered && (
          <div className="flex-none px-4 py-3 bg-yellow-950 border border-yellow-500 rounded-xl text-sm text-yellow-200 font-bold">
            🎉 Félicitations ! Vous avez maîtrisé ce caractère !
          </div>
        )}
        {isMastered && !justMastered && (
          <div className="flex-none inline-block px-4 py-2 bg-green-950 border border-green-600 rounded-xl text-sm text-green-300 font-semibold">
            ⭐ Maîtrisé — continuez pour renforcer votre mémoire
          </div>
        )}

        {fillHeight ? (
          /* fillHeight: compact single row — progress bar + buttons side by side */
          <div className="flex-none flex items-center gap-2">
            <div className="flex-1 space-y-0.5 min-w-0">
              <div className="flex justify-between text-xs text-zinc-400">
                <span className="truncate">{config.step}</span>
                <span className="ml-1 shrink-0">{Math.min(practiceLevel, 5)}/5</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${isMastered ? "bg-green-500" : "bg-blue-500"}`}
                  style={{ width: `${(Math.min(practiceLevel, 5) / 5) * 100}%` }}
                />
              </div>
            </div>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="shrink-0 h-8 px-3 rounded-lg bg-red-500 hover:bg-red-600 active:bg-red-700 text-white text-xs font-bold transition-colors"
            >
              🗑️
            </button>
            <button
              onClick={handleClear}
              className="shrink-0 h-8 px-3 rounded-lg bg-zinc-700 hover:bg-zinc-600 active:bg-zinc-500 text-white text-xs font-bold transition-colors"
            >
              🔄
            </button>
          </div>
        ) : (
          <>
            {/* Level progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>{config.label} — {config.step}</span>
                <span>{Math.min(practiceLevel, 5)}/5</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${isMastered ? "bg-green-500" : "bg-blue-500"}`}
                  style={{ width: `${(Math.min(practiceLevel, 5) / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600 active:bg-red-700 text-white text-sm font-bold transition-colors"
              >
                🗑️ Effacer
              </button>
              <button
                onClick={handleClear}
                className="flex-1 h-10 rounded-xl bg-zinc-700 hover:bg-zinc-600 active:bg-zinc-500 text-white text-sm font-bold transition-colors"
              >
                🔄 Réessayer
              </button>
            </div>
          </>
        )}

        {/* Canvas + overlays */}
        {fillHeight ? (
          <div ref={setCanvasAreaEl} className="flex-1 min-h-0 flex items-center justify-center">
            {canvasAreaSize > 0 && (
              <div className="relative" style={{ width: canvasAreaSize, height: canvasAreaSize }}>
                <DrawCanvas
                  ref={canvasRef}
                  fluid
                  onStrokeComplete={handleStrokeComplete}
                  onStrokeStart={onStrokeStart}
                  onRealtimeFeedback={onRealtimeFeedback}
                  guidePaths={config.guide ? character.svgPaths : undefined}
                  guideMode={config.guide}
                  borderColor={canvasBorderColor}
                />
                {overlays}
              </div>
            )}
          </div>
        ) : (
          <div className={cn("relative w-full", canvasClassName)}>
            <DrawCanvas
              ref={canvasRef}
              fluid
              onStrokeComplete={handleStrokeComplete}
              onStrokeStart={onStrokeStart}
              onRealtimeFeedback={onRealtimeFeedback}
              guidePaths={config.guide ? character.svgPaths : undefined}
              guideMode={config.guide}
              borderColor={canvasBorderColor}
            />
            {overlays}
          </div>
        )}

        <style>{`
          @keyframes popIn {
            0%   { transform: translate(-50%, -50%) scale(0); }
            50%  { transform: translate(-50%, -50%) scale(1.1); }
            100% { transform: translate(-50%, -50%) scale(1); }
          }
          @keyframes toastSlide {
            0%   { transform: translateY(-110%); opacity: 0; }
            100% { transform: translateY(0);     opacity: 1; }
          }
        `}</style>
      </div>
    </>
  );
}
