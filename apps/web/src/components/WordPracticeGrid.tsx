"use client"

import React, { useRef, useState, useCallback, useEffect } from "react"
import DrawCanvas, { DrawCanvasHandle } from "./DrawCanvas"
import {
  validateCharacter,
  buildWaypoints,
  getRealtimeStatus,
  shouldAdvanceGate,
} from "../lib/stroke-validator"
import type { LevelConfig } from "../lib/stroke-validator"

interface Word {
  id: string
  text: string
  reading: string
  meaning: string
  audioText?: string
}

interface WordPracticeGridProps {
  word: Word
  level: number
  lang?: string
  variant?: "light" | "dark"
  onComplete: (score: number) => void
}

const LEVEL_CONFIG: Array<LevelConfig & {
  guide: "full-thick" | "full" | "dotted-dense" | "dotted" | "dots" | undefined
  label: string
}> = [
  { guide: "full-thick",   waypointN: 8,  tolerancePx: 60, validThreshold: 0.45, label: "Étape 1" },
  { guide: "full",         waypointN: 8,  tolerancePx: 50, validThreshold: 0.50, label: "Étape 2" },
  { guide: "dotted-dense", waypointN: 8,  tolerancePx: 40, validThreshold: 0.53, label: "Étape 3" },
  { guide: "dotted",       waypointN: 9,  tolerancePx: 32, validThreshold: 0.56, label: "Étape 4" },
  { guide: "dots",         waypointN: 9,  tolerancePx: 26, validThreshold: 0.60, label: "Étape 5" },
  { guide: undefined,      waypointN: 10, tolerancePx: 22, validThreshold: 0.63, label: "Étape 6" },
]

export default function WordPracticeGrid({ word, level, lang, variant, onComplete }: WordPracticeGridProps) {
  const cfg = LEVEL_CONFIG[Math.max(0, Math.min(5, level - 1))]!

  const isDark = variant === "dark"
  const cls = {
    container: isDark
      ? "rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden"
      : "rounded-xl border border-blue-100 bg-[#FAFAF8] overflow-hidden",
    rule:         isDark ? "border-t border-zinc-800"          : "border-t border-blue-100",
    modelWord:    isDark ? "text-zinc-600"                     : "text-gray-300",
    levelLabel:   isDark ? "text-zinc-200"                     : "text-gray-800",
    meaning:      isDark ? "text-zinc-400"                     : "text-gray-500",
    letterDone:   isDark ? "bg-green-950/30 text-green-400"    : "bg-green-100 text-green-700",
    letterPending:isDark ? "bg-zinc-800 text-zinc-500"         : "bg-gray-100 text-gray-400",
    dotPending:   isDark ? "bg-zinc-700"                       : "bg-gray-200",
    feedback:     isDark ? "text-zinc-400"                     : "text-gray-600",
  }

  const letters = Array.from(word.text)
  const [letterIndex, setLetterIndex] = useState(0)
  const [letterPaths, setLetterPaths] = useState<Record<string, string[]>>({})
  const [feedback, setFeedback] = useState<string | null>(null)
  const [scores, setScores] = useState<number[]>([])
  // tracks how many strokes the user has completed for the current letter
  const [drawnStrokes, setDrawnStrokes] = useState(0)

  const canvasRef = useRef<DrawCanvasHandle>(null)
  const gateRef   = useRef<number>(0)
  const waypointsRef = useRef<{ x: number; y: number }[]>([])

  // Fetch SVG paths for every character in this language
  useEffect(() => {
    fetch(`/api/characters?lang=${lang ?? "ru-RU"}`)
      .then((r) => r.json())
      .then((chars: Array<{ label: string; svgPaths: string[] }>) => {
        const map: Record<string, string[]> = {}
        for (const c of chars) {
          map[c.label] = c.svgPaths
          // Also map the lowercase version so Russian words (мама) find uppercase labels (М)
          map[c.label.toLowerCase()] = c.svgPaths
        }
        setLetterPaths(map)
      })
      .catch((err) => console.error("Failed to load character paths", err))
  }, [lang])

  const currentLetter = letters[letterIndex] ?? ""
  // Exact match first, then uppercase fallback (Russian words use lowercase, labels uppercase)
  const currentPaths =
    letterPaths[currentLetter] ??
    letterPaths[currentLetter.toUpperCase()] ??
    []

  // When the user lifts the pen and starts the NEXT stroke, update waypoints for that stroke.
  // completedCount = number of strokes already completed = index of the stroke about to start.
  const handleStrokeStart = useCallback(
    (completedCount: number) => {
      setDrawnStrokes(completedCount)
      const path = currentPaths[completedCount]
      if (path) {
        waypointsRef.current = buildWaypoints(path, cfg.waypointN)
      }
      gateRef.current = 0
    },
    [currentPaths, cfg.waypointN],
  )

  const handleRealtimeFeedback = useCallback(
    (point: { x: number; y: number }): "on" | "near" | "off" => {
      const wp = waypointsRef.current
      if (!wp.length) return "off"
      if (shouldAdvanceGate(point, wp, gateRef.current, cfg.tolerancePx)) {
        gateRef.current = Math.min(gateRef.current + 1, wp.length - 1)
      }
      return getRealtimeStatus(point, wp, gateRef.current, cfg.tolerancePx)
    },
    [cfg.tolerancePx],
  )

  const handleStrokeComplete = useCallback(
    (strokes: Array<{ x: number; y: number }[]>) => {
      if (!currentPaths.length || !strokes.length) return

      // Keep accumulating strokes until we have all of them for this letter.
      // guidePaths = currentPaths (all strokes shown at once) so DrawCanvas never
      // resets allStrokes between strokes of the same letter.
      if (strokes.length < currentPaths.length) return

      const result = validateCharacter(strokes, currentPaths, {
        levelConfig: {
          waypointN: cfg.waypointN,
          tolerancePx: cfg.tolerancePx,
          validThreshold: cfg.validThreshold,
        },
      })

      setFeedback(result.feedback)

      const reset = () => {
        canvasRef.current?.clear()
        gateRef.current = 0
        setDrawnStrokes(0)
      }

      if (result.isValid) {
        const newScores = [...scores, result.score]
        setScores(newScores)
        reset()

        const nextLetter = letterIndex + 1
        if (nextLetter < letters.length) {
          setLetterIndex(nextLetter)
          setFeedback(null)
        } else {
          const avg = Math.round(newScores.reduce((a, b) => a + b, 0) / newScores.length)
          onComplete(avg)
        }
      } else {
        reset()
      }
    },
    [currentPaths, letterIndex, letters, scores, cfg, onComplete],
  )

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto p-4">
      {/* Level + meaning */}
      <div className={`flex items-center gap-2 text-sm ${cls.meaning}`}>
        <span className={`font-medium ${cls.levelLabel}`}>{cfg.label}</span>
        <span>·</span>
        <span>{word.meaning}</span>
      </div>

      {/* Copybook card */}
      <div className={`w-full ${cls.container}`}>
        {/* Model word line */}
        <div className={`relative h-20 border-b ${isDark ? "border-zinc-800" : "border-blue-100"}`}>
          <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`w-full ${cls.rule}`} />
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={`text-3xl font-normal tracking-widest select-none ${cls.modelWord}`}
              style={{ fontFamily: "'Noto Sans', sans-serif" }}
            >
              {word.text}
            </span>
          </div>
        </div>

        {/* Drawing canvas — square so that 109×109 SVG paths fit without clipping */}
        <div className="flex justify-center p-3">
          <DrawCanvas
            ref={canvasRef}
            width={300}
            height={300}
            guidePaths={currentPaths}
            guideMode={cfg.guide}
            onStrokeStart={handleStrokeStart}
            onRealtimeFeedback={handleRealtimeFeedback}
            onStrokeComplete={handleStrokeComplete}
            borderColor={isDark ? "#3f3f46" : "#ddd"}
          />
        </div>
      </div>

      {/* Letter progress pills */}
      <div className="flex gap-2 items-center flex-wrap justify-center">
        {letters.map((l, i) => (
          <div
            key={i}
            className={[
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
              i < letterIndex
                ? cls.letterDone
                : i === letterIndex
                ? "bg-blue-500 text-white scale-110 shadow-md"
                : cls.letterPending,
            ].join(" ")}
          >
            {l}
          </div>
        ))}
      </div>

      {/* Feedback message */}
      {feedback && (
        <p className={`text-sm text-center min-h-[1.25rem] ${cls.feedback}`}>{feedback}</p>
      )}

      {/* Stroke progress dots (multi-stroke letters only) */}
      {currentPaths.length > 1 && (
        <div className="flex gap-1.5">
          {currentPaths.map((_, i) => (
            <div
              key={i}
              className={[
                "w-2 h-2 rounded-full transition-colors",
                i < drawnStrokes
                  ? "bg-green-400"
                  : i === drawnStrokes
                  ? "bg-blue-500"
                  : cls.dotPending,
              ].join(" ")}
            />
          ))}
        </div>
      )}
    </div>
  )
}
