"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import DrawCanvas, { DrawCanvasHandle } from "./DrawCanvas";
import type { Character } from "../data/characters";
import { validateCharacter, buildWaypoints, getRealtimeStatus, shouldAdvanceGate } from "../lib/stroke-validator";
import type { LevelConfig } from "../lib/stroke-validator";

const LEVEL_CONFIG: Array<LevelConfig & {
  guide: "full-thick" | "full" | "dotted-dense" | "dotted" | "dots" | undefined;
  label: string;
  step: string;
}> = [
  { guide: "full-thick",   waypointN: 6,  tolerancePx: 45, sequentialThreshold: 55, label: "Étape 1",  step: "Suis le tracé épais" },
  { guide: "full",         waypointN: 8,  tolerancePx: 38, sequentialThreshold: 60, label: "Étape 2",  step: "Tracé visible" },
  { guide: "dotted-dense", waypointN: 8,  tolerancePx: 30, sequentialThreshold: 65, label: "Étape 3",  step: "Pointillés denses" },
  { guide: "dotted",       waypointN: 10, tolerancePx: 25, sequentialThreshold: 70, label: "Étape 4",  step: "Pointillés épars" },
  { guide: "dots",         waypointN: 10, tolerancePx: 20, sequentialThreshold: 72, label: "Étape 5",  step: "Quelques repères" },
  { guide: undefined,      waypointN: 12, tolerancePx: 18, sequentialThreshold: 75, label: "Étape 6",  step: "De mémoire 🎯" },
];

interface PracticeGridProps {
  character: Character;
  onSuccess?: () => void;
}

interface ValidationFeedback {
  isValid: boolean;
  score: number;
  feedback: string;
}

export default function PracticeGrid({ character, onSuccess }: PracticeGridProps) {
  const [practiceLevel, setPracticeLevel] = useState(0);
  const [isLoadingLevel, setIsLoadingLevel] = useState(true);
  const [currentStrokes, setCurrentStrokes] = useState<Array<Array<{ x: number; y: number }>>>([]);
  const [validationFeedback, setValidationFeedback] = useState<ValidationFeedback | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [justMastered, setJustMastered] = useState(false);
  const canvasRef = useRef<DrawCanvasHandle | null>(null);

  // Real-time gate tracking (all refs — no re-renders during drawing)
  const gateIndexRef = useRef(0);
  const currentStrokeIdxRef = useRef(0);
  const waypointsPerStrokeRef = useRef<Array<Array<{ x: number; y: number }>>>([]);
  const practiceLevelRef = useRef(0);
  // When true, level progression ignores the API response and advances locally (used by "Recommencer")
  const isRestartModeRef = useRef(false);

  // Keep refs in sync with state
  useEffect(() => { practiceLevelRef.current = practiceLevel; }, [practiceLevel]);

  // Precompute waypoints whenever character or practiceLevel changes
  useEffect(() => {
    const config = LEVEL_CONFIG[Math.min(practiceLevel, LEVEL_CONFIG.length - 1)]!;
    waypointsPerStrokeRef.current = character.svgPaths.map(path =>
      buildWaypoints(path, config.waypointN, 300),
    );
    gateIndexRef.current = 0;
    currentStrokeIdxRef.current = 0;
  }, [character, practiceLevel]);

  // Load current practiceLevel from DB on character change
  useEffect(() => {
    setIsLoadingLevel(true);
    setCurrentStrokes([]);
    setValidationFeedback(null);
    setIsCorrect(false);
    setJustMastered(false);
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

  const onStrokeStart = useCallback((completedCount: number) => {
    currentStrokeIdxRef.current = completedCount;
    gateIndexRef.current = 0;
  }, []);

  const onRealtimeFeedback = useCallback(
    (point: { x: number; y: number }): "on" | "near" | "off" => {
      const config = LEVEL_CONFIG[Math.min(practiceLevelRef.current, LEVEL_CONFIG.length - 1)]!;
      const waypoints = waypointsPerStrokeRef.current[currentStrokeIdxRef.current] ?? [];
      // Gate advancement uses strict single-gate check
      if (shouldAdvanceGate(point, waypoints, gateIndexRef.current, config.tolerancePx)) {
        gateIndexRef.current += 1;
      }
      // Coloring uses a window of gates for smooth between-gate feedback
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
          sequentialThreshold: config.sequentialThreshold,
        },
      });

      setValidationFeedback({ isValid: result.isValid, score: result.score, feedback: result.feedback });
      setIsCorrect(result.isValid);

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
          // In restart mode, progress locally level by level instead of jumping to the DB level
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
    [character],
  );

  const handleClear = useCallback(() => {
    canvasRef.current?.clear();
    setCurrentStrokes([]);
    setIsCorrect(false);
    setValidationFeedback(null);
    gateIndexRef.current = 0;
    currentStrokeIdxRef.current = 0;
  }, []);

  if (isLoadingLevel) {
    return <div style={{ padding: "20px", color: "#666", fontSize: "14px" }}>Chargement de votre progression…</div>;
  }

  const config = LEVEL_CONFIG[Math.min(practiceLevel, LEVEL_CONFIG.length - 1)]!;
  const isMastered = practiceLevel >= 5;

  return (
    <div>
      {justMastered && (
        <div style={{
          marginBottom: "12px", padding: "12px 16px",
          background: "#fef08a", border: "1px solid #fbbf24",
          borderRadius: "8px", fontSize: "14px", color: "#854d0e", fontWeight: "bold",
        }}>
          🎉 Félicitations ! Vous avez maîtrisé ce caractère !
        </div>
      )}
      {isMastered && !justMastered && (
        <div style={{
          marginBottom: "12px", padding: "8px 16px",
          background: "#dcfce7", border: "1px solid #86efac",
          borderRadius: "8px", fontSize: "14px", color: "#166534", fontWeight: "600",
          display: "inline-block",
        }}>
          ⭐ Maîtrisé — continuez pour renforcer votre mémoire
        </div>
      )}

      {/* Level progress bar */}
      <div style={{ marginBottom: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "12px", color: "#9ca3af" }}>
          <span>{config.label} — {config.step}</span>
          <span>{Math.min(practiceLevel, 5)}/5</span>
        </div>
        <div style={{ background: "#e5e7eb", borderRadius: "4px", height: "6px" }}>
          <div style={{
            background: isMastered ? "#22c55e" : "#3b82f6",
            borderRadius: "4px",
            height: "6px",
            width: `${(Math.min(practiceLevel, 5) / 5) * 100}%`,
            transition: "width 0.5s ease",
          }} />
        </div>
      </div>

      <div style={{ position: "relative", display: "inline-block" }}>
        <DrawCanvas
          ref={canvasRef}
          width={300}
          height={300}
          onStrokeComplete={handleStrokeComplete}
          onStrokeStart={onStrokeStart}
          onRealtimeFeedback={onRealtimeFeedback}
          guidePaths={config.guide ? character.svgPaths : undefined}
          guideMode={config.guide}
          borderColor={
            isCorrect
              ? "#22c55e"
              : validationFeedback && !validationFeedback.isValid
                ? "#ef4444"
                : currentStrokes.length > 0
                  ? "#3b82f6"
                  : "#ddd"
          }
        />

        {isCorrect && (
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(34, 197, 94, 0.95)", color: "white",
            borderRadius: "50%", width: "80px", height: "80px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "48px", fontWeight: "bold", animation: "popIn 0.3s ease-out",
          }}>✓</div>
        )}

        {validationFeedback && !validationFeedback.isValid &&
          currentStrokes.length === character.svgPaths.length && (
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(239, 68, 68, 0.95)", color: "white",
            borderRadius: "50%", width: "80px", height: "80px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "48px", fontWeight: "bold", animation: "popIn 0.3s ease-out",
          }}>✗</div>
        )}

        {currentStrokes.length > 0 && (
          <div style={{
            position: "absolute", bottom: "12px", right: "12px",
            background: "rgba(0,0,0,0.8)", color: "white",
            padding: "6px 12px", borderRadius: "6px",
            fontSize: "14px", fontWeight: "bold",
          }}>
            {currentStrokes.length}/{character.strokeCount}
          </div>
        )}
      </div>

      {validationFeedback && currentStrokes.length === character.svgPaths.length && (
        <div style={{
          marginTop: "16px", padding: "12px",
          background: validationFeedback.isValid ? "#dcfce7" : "#fee2e2",
          borderRadius: "8px", fontSize: "14px",
          color: validationFeedback.isValid ? "#166534" : "#991b1b",
        }}>
          <p style={{ margin: 0, fontWeight: "bold" }}>{validationFeedback.feedback}</p>
          <p style={{ margin: "4px 0 0 0", fontSize: "12px" }}>
            Score : {Math.round(validationFeedback.score)}/100
          </p>
        </div>
      )}

      <div style={{ marginTop: "16px", display: "flex", gap: "12px" }}>
        <button
          onClick={handleClear}
          style={{
            flex: 1, padding: "12px",
            background: "#ef4444", color: "white",
            border: "none", borderRadius: "8px",
            cursor: "pointer", fontSize: "16px", fontWeight: "bold",
          }}
        >
          🗑️ Effacer
        </button>
        <button
          onClick={() => { isRestartModeRef.current = true; setPracticeLevel(0); setJustMastered(false); handleClear(); }}
          style={{
            flex: 1, padding: "12px",
            background: "#6b7280", color: "white",
            border: "none", borderRadius: "8px",
            cursor: "pointer", fontSize: "16px", fontWeight: "bold",
          }}
        >
          🔄 Recommencer
        </button>
      </div>

      <style>{`
        @keyframes popIn {
          0%   { transform: translate(-50%, -50%) scale(0); }
          50%  { transform: translate(-50%, -50%) scale(1.1); }
          100% { transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </div>
  );
}
