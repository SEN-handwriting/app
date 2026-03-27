"use client";

import React, { useRef, useState, useEffect } from "react";
import DrawCanvas, { DrawCanvasHandle } from "./DrawCanvas";
import type { Character } from "../data/characters";
import { validateCharacter } from "../lib/stroke-validator";

interface PracticeGridProps {
  character: Character;
}

type GuideMode = "full" | "dotted" | "empty";

interface ValidationFeedback {
  isValid: boolean;
  score: number;
  feedback: string;
}

export default function PracticeGrid({ character }: PracticeGridProps) {
  const [attempts, setAttempts] = useState(0);
  const [isLoadingLevel, setIsLoadingLevel] = useState(true);
  const [currentStrokes, setCurrentStrokes] = useState<Array<Array<{ x: number; y: number }>>>([]);
  const [validationFeedback, setValidationFeedback] = useState<ValidationFeedback | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [justMastered, setJustMastered] = useState(false);
  const canvasRef = useRef<DrawCanvasHandle | null>(null);

  // Load current practiceLevel from DB on character change
  useEffect(() => {
    setIsLoadingLevel(true);
    setCurrentStrokes([]);
    setValidationFeedback(null);
    setIsCorrect(false);
    setJustMastered(false);
    canvasRef.current?.clear();

    fetch(`/api/progress?characterId=${encodeURIComponent(character.id)}`)
      .then((r) => r.json())
      .then((data: { practiceLevel: number }) => {
        setAttempts(data.practiceLevel ?? 0);
      })
      .catch(() => {
        setAttempts(0);
      })
      .finally(() => setIsLoadingLevel(false));
  }, [character.id]);

  const getGuideMode = (level: number): GuideMode => {
    if (level === 0) return "full";
    if (level === 1) return "dotted";
    return "empty";
  };

  const handleStrokeComplete = (strokes: Array<Array<{ x: number; y: number }>>) => {
    setCurrentStrokes(strokes);
    setValidationFeedback(null);

    if (strokes.length !== character.svgPaths.length) return;

    const result = validateCharacter(strokes, character.svgPaths, { debug: true });

    setValidationFeedback({
      isValid: result.isValid,
      score: result.score,
      feedback: result.feedback,
    });
    setIsCorrect(result.isValid);

    // Fire API call immediately (background for failures, awaited for successes)
    const apiCall = fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        characterId: character.id,
        score: result.score,
        isSuccess: result.isValid,
      }),
    })
      .then((r) => (r.ok ? (r.json() as Promise<{ practiceLevel: number; mastered: boolean }>) : null))
      .catch(() => null);

    if (result.isValid) {
      const levelAtAttempt = attempts;
      setTimeout(async () => {
        const data = await apiCall;
        const nextLevel = data?.practiceLevel ?? Math.min(2, levelAtAttempt + 1);
        const justGotMastered = nextLevel >= 2 && levelAtAttempt < 2;

        if (justGotMastered) setJustMastered(true);
        setAttempts(nextLevel);
        setCurrentStrokes([]);
        setValidationFeedback(null);
        setIsCorrect(false);
        canvasRef.current?.clear();
      }, 1500);
    }
  };

  const handleClear = () => {
    canvasRef.current?.clear();
    setCurrentStrokes([]);
    setIsCorrect(false);
    setValidationFeedback(null);
  };

  const guideMode = getGuideMode(attempts);
  const isMastered = attempts >= 2;

  if (isLoadingLevel) {
    return <div style={{ padding: "20px", color: "#666", fontSize: "14px" }}>Chargement de votre progression…</div>;
  }

  return (
    <div>
      {/* Mastered / just-mastered banners */}
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

      {/* Current mode label */}
      <div style={{ marginBottom: "16px", fontSize: "14px", color: "#666" }}>
        {guideMode === "full"   && <p>📝 <strong>Étape 1</strong> — Suivez le tracé complet</p>}
        {guideMode === "dotted" && <p>✏️ <strong>Étape 2</strong> — Suivez les pointillés</p>}
        {guideMode === "empty"  && <p>🎯 <strong>De mémoire</strong> — À vous de jouer !</p>}
      </div>

      {/* Canvas + overlays */}
      <div style={{ position: "relative", display: "inline-block" }}>
        <DrawCanvas
          ref={canvasRef}
          width={300}
          height={300}
          onStrokeComplete={handleStrokeComplete}
          guidePaths={guideMode !== "empty" ? character.svgPaths : undefined}
          guideMode={guideMode !== "empty" ? guideMode : undefined}
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

        {/* Success indicator */}
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

        {/* Error indicator */}
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

        {/* Stroke counter */}
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

      {/* Validation feedback */}
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

      {/* Buttons */}
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
          onClick={() => { setAttempts(0); setJustMastered(false); handleClear(); }}
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

      {/* Progress level */}
      <div style={{
        marginTop: "16px", padding: "12px",
        background: "#f3f4f6", borderRadius: "8px", fontSize: "14px",
      }}>
        <p style={{ margin: 0, color: "#374151" }}>
          <strong>Niveau :</strong>{" "}
          {attempts === 0 && "Débutant (tracé visible)"}
          {attempts === 1 && "Intermédiaire (pointillés)"}
          {attempts >= 2 && "Maîtrisé (de mémoire) ⭐"}
        </p>
      </div>

      <style jsx>{`
        @keyframes popIn {
          0%   { transform: translate(-50%, -50%) scale(0); }
          50%  { transform: translate(-50%, -50%) scale(1.1); }
          100% { transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </div>
  );
}
