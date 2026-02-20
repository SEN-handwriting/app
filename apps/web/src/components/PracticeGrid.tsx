"use client";

import React, { useRef, useState } from "react";
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
  currentStrokeIndex: number;
  currentStrokeFeedback?: string;
}

export default function PracticeGrid({ character }: PracticeGridProps) {
  const [attempts, setAttempts] = useState(0);
  const [currentStrokes, setCurrentStrokes] = useState<
    Array<Array<{ x: number; y: number }>>
  >([]);
  const [validationFeedback, setValidationFeedback] =
    useState<ValidationFeedback | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const canvasRef = useRef<DrawCanvasHandle | null>(null);

  // Déterminer le mode de guide selon le nombre d'essais
  const getGuideMode = (): GuideMode => {
    if (attempts === 0) return "full";
    if (attempts === 1) return "dotted";
    return "empty";
  };

  const handleStrokeComplete = (
    strokes: Array<Array<{ x: number; y: number }>>,
  ) => {
    setCurrentStrokes(strokes);

    // Réinitialiser le feedback pour chaque nouveau trait
    setValidationFeedback(null);

    // Valider UNIQUEMENT quand on a tous les traits
    if (strokes.length === character.svgPaths.length) {
      const result = validateCharacter(strokes, character.svgPaths, {
        debug: true,
      });

      setValidationFeedback({
        isValid: result.isValid,
        score: result.score,
        feedback: result.feedback,
        currentStrokeIndex: strokes.length - 1,
      });

      setIsCorrect(result.isValid);

      // Si correct, passer à l'essai suivant après un délai
      if (result.isValid) {
        setTimeout(() => {
          setAttempts(prev => prev + 1);
          setCurrentStrokes([]);
          setValidationFeedback(null);
          setIsCorrect(false);
          canvasRef.current?.clear();
        }, 1500);
      }
    }
  };

  const handleClear = () => {
    canvasRef.current?.clear();
    setCurrentStrokes([]);
    setIsCorrect(false);
    setValidationFeedback(null);
  };

  const guideMode = getGuideMode();

  return (
    <div>
      {/* Info sur le mode actuel */}
      <div style={{ marginBottom: "16px", fontSize: "14px", color: "#666" }}>
        {guideMode === "full" && (
          <p>
            📝 <strong>Essai 1</strong> : Suivez le tracé complet
          </p>
        )}
        {guideMode === "dotted" && (
          <p>
            ✏️ <strong>Essai 2</strong> : Suivez les pointillés
          </p>
        )}
        {guideMode === "empty" && (
          <p>
            🎯 <strong>Essai {attempts + 1}</strong> : À vous de jouer !
          </p>
        )}
      </div>

      {/* Le carré de pratique avec overlay */}
      <div style={{ position: "relative", display: "inline-block" }}>
        <DrawCanvas
          ref={canvasRef}
          width={300}
          height={300}
          onStrokeComplete={handleStrokeComplete}
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

        {/* Overlay avec le guide (full ou dotted) */}
        {guideMode !== "empty" && (
          <svg
            viewBox="0 0 109 109"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "300px",
              height: "300px",
              pointerEvents: "none",
            }}
          >
            {character.svgPaths.map((d, i) => (
              <path
                key={i}
                d={d}
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="2.5"
                stroke={guideMode === "full" ? "#cccccc" : "#e5e5e5"}
                strokeDasharray={guideMode === "dotted" ? "5,5" : "none"}
                fill="none"
              />
            ))}
          </svg>
        )}

        {/* Indicateur de succès */}
        {isCorrect && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "rgba(34, 197, 94, 0.95)",
              color: "white",
              borderRadius: "50%",
              width: "80px",
              height: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "48px",
              fontWeight: "bold",
              animation: "popIn 0.3s ease-out",
            }}
          >
            ✓
          </div>
        )}

        {/* Indicateur d'erreur (seulement quand tous les traits sont dessinés) */}
        {validationFeedback &&
          !validationFeedback.isValid &&
          currentStrokes.length === character.svgPaths.length && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "rgba(239, 68, 68, 0.95)",
                color: "white",
                borderRadius: "50%",
                width: "80px",
                height: "80px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "48px",
                fontWeight: "bold",
                animation: "popIn 0.3s ease-out",
              }}
            >
              ✗
            </div>
          )}

        {/* Compteur de traits */}
        {currentStrokes.length > 0 && (
          <div
            style={{
              position: "absolute",
              bottom: "12px",
              right: "12px",
              background: "rgba(0,0,0,0.8)",
              color: "white",
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            {currentStrokes.length}/{character.strokeCount}
          </div>
        )}
      </div>

      {/* Feedback de validation (seulement quand tous les traits sont dessinés) */}
      {validationFeedback &&
        currentStrokes.length === character.svgPaths.length && (
          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              background: validationFeedback.isValid ? "#dcfce7" : "#fee2e2",
              borderRadius: "8px",
              fontSize: "14px",
              color: validationFeedback.isValid ? "#166534" : "#991b1b",
            }}
          >
            <p style={{ margin: 0, fontWeight: "bold" }}>
              {validationFeedback.feedback}
            </p>
            {validationFeedback.score !== undefined && (
              <p style={{ margin: "4px 0 0 0", fontSize: "12px" }}>
                Score: {Math.round(validationFeedback.score)}/100
              </p>
            )}
          </div>
        )}

      {/* Boutons */}
      <div style={{ marginTop: "16px", display: "flex", gap: "12px" }}>
        <button
          onClick={handleClear}
          style={{
            flex: 1,
            padding: "12px",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          🗑️ Effacer
        </button>
        <button
          onClick={() => {
            setAttempts(0);
            handleClear();
          }}
          style={{
            flex: 1,
            padding: "12px",
            background: "#6b7280",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          🔄 Recommencer
        </button>
      </div>

      {/* Statistiques */}
      <div
        style={{
          marginTop: "16px",
          padding: "12px",
          background: "#f3f4f6",
          borderRadius: "8px",
          fontSize: "14px",
        }}
      >
        <p style={{ margin: 0, color: "#374151" }}>
          <strong>Progression :</strong> {attempts} essai
          {attempts > 1 ? "s" : ""} réussi{attempts > 1 ? "s" : ""}
        </p>
      </div>

      <style jsx>{`
        @keyframes popIn {
          0% {
            transform: translate(-50%, -50%) scale(0);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
