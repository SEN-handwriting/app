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

const GAP = 10

// Compute per-letter canvas size based on available container width
function getLayout(n: number, availableWidth: number): { canvasSize: number; perRow: number } {
  const perRow = n === 1 ? 1 : n <= 3 ? n : n === 4 ? 2 : 3
  const canvasSize = Math.max(60, Math.floor((availableWidth - GAP * (perRow - 1)) / perRow))
  return { canvasSize, perRow }
}

type LetterStatus = "idle" | "valid" | "invalid"

interface LetterBoxProps {
  index: number
  letter: string
  paths: string[]
  canvasSize: number
  cfg: typeof LEVEL_CONFIG[number]
  isDark: boolean
  onValid: (index: number, score: number) => void
}

function LetterBox({ index, letter, paths, canvasSize, cfg, isDark, onValid }: LetterBoxProps) {
  const canvasRef    = useRef<DrawCanvasHandle>(null)
  const gateRef      = useRef(0)
  const waypointsRef = useRef<{ x: number; y: number }[]>([])
  const [drawn,  setDrawn]  = useState(0)
  const [status, setStatus] = useState<LetterStatus>("idle")

  // Tolerance scaled to actual canvas size (paths were designed for 300px canvas)
  const tolerance = cfg.tolerancePx * (canvasSize / 300)

  const handleStrokeStart = useCallback(
    (completedCount: number) => {
      setDrawn(completedCount)
      const path = paths[completedCount]
      if (path) waypointsRef.current = buildWaypoints(path, cfg.waypointN, canvasSize)
      gateRef.current = 0
    },
    [paths, cfg.waypointN, canvasSize],
  )

  const handleRealtimeFeedback = useCallback(
    (point: { x: number; y: number }): "on" | "near" | "off" => {
      const wp = waypointsRef.current
      if (!wp.length) return "off"
      if (shouldAdvanceGate(point, wp, gateRef.current, tolerance)) {
        gateRef.current = Math.min(gateRef.current + 1, wp.length - 1)
      }
      return getRealtimeStatus(point, wp, gateRef.current, tolerance)
    },
    [tolerance],
  )

  const handleStrokeComplete = useCallback(
    (strokes: Array<{ x: number; y: number }[]>) => {
      if (!paths.length || !strokes.length) return

      if (strokes.length > paths.length) {
        canvasRef.current?.clear()
        gateRef.current = 0
        setDrawn(0)
        return
      }
      if (strokes.length < paths.length) return

      const result = validateCharacter(strokes, paths, {
        canvasSize,
        levelConfig: {
          waypointN:      cfg.waypointN,
          tolerancePx:    tolerance,
          validThreshold: cfg.validThreshold,
        },
      })

      if (result.isValid) {
        setStatus("valid")
        onValid(index, result.score)
      } else {
        setStatus("invalid")
        setTimeout(() => {
          canvasRef.current?.clear()
          gateRef.current = 0
          setDrawn(0)
          setStatus("idle")
        }, 700)
      }
    },
    [paths, cfg, canvasSize, tolerance, onValid, index],
  )

  const borderColor =
    status === "valid"   ? "#22c55e" :
    status === "invalid" ? "#ef4444" :
    isDark ? "#52525b" : "#d1d5db"

  const isActive = status !== "valid"

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Model letter */}
      <span
        className={`text-sm font-medium select-none ${isDark ? "text-zinc-500" : "text-gray-400"}`}
        style={{ fontFamily: "'Noto Sans', sans-serif" }}
      >
        {letter}
      </span>

      {/* Canvas + valid overlay */}
      <div className="relative w-full">
        <DrawCanvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          guidePaths={isActive ? paths : undefined}
          guideMode={isActive ? cfg.guide : undefined}
          onStrokeStart={isActive ? handleStrokeStart : undefined}
          onRealtimeFeedback={isActive ? handleRealtimeFeedback : undefined}
          onStrokeComplete={isActive ? handleStrokeComplete : undefined}
          borderColor={borderColor}
        />
        {status === "valid" && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded pointer-events-none"
            style={{ background: "rgba(34,197,94,0.15)" }}
          >
            <span className="text-green-400 font-bold" style={{ fontSize: canvasSize * 0.42 }}>✓</span>
          </div>
        )}
      </div>

      {/* Stroke-progress dots (multi-stroke letters only, while not yet valid) */}
      {paths.length > 1 && isActive && (
        <div className="flex gap-1">
          {paths.map((_, si) => (
            <div
              key={si}
              className={[
                "w-2 h-2 rounded-full transition-colors",
                si < drawn  ? "bg-green-400" :
                si === drawn ? "bg-blue-500" :
                isDark ? "bg-zinc-600" : "bg-gray-300",
              ].join(" ")}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function WordPracticeGrid({ word, level, lang, variant, onComplete }: WordPracticeGridProps) {
  const cfg      = LEVEL_CONFIG[Math.max(0, Math.min(5, level - 1))]!
  const isDark   = variant === "dark"
  const letters  = Array.from(word.text)
  const n        = letters.length

  const [letterPaths, setLetterPaths] = useState<Record<string, string[]>>({})
  const [validCount, setValidCount]   = useState(0)
  const [containerWidth, setContainerWidth] = useState(320)
  const gridRef = useRef<HTMLDivElement | null>(null)

  const validatedRef = useRef<boolean[]>(letters.map(() => false))
  const scoresRef    = useRef<number[]>([])

  // Measure grid container for responsive canvas sizing
  useEffect(() => {
    const el = gridRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width
      if (w && w > 0) setContainerWidth(Math.floor(w))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    fetch(`/api/characters?lang=${lang ?? "ru-RU"}`)
      .then((r) => r.json())
      .then((chars: Array<{ label: string; svgPaths: string[] }>) => {
        const map: Record<string, string[]> = {}
        for (const c of chars) {
          map[c.label] = c.svgPaths
          map[c.label.toLowerCase()] = c.svgPaths
        }
        setLetterPaths(map)
      })
      .catch((err) => console.error("Failed to load character paths", err))
  }, [lang])

  const getPaths = (letter: string): string[] =>
    letterPaths[letter] ?? letterPaths[letter.toUpperCase()] ?? []

  const { canvasSize, perRow } = getLayout(n, containerWidth)

  const handleLetterValid = useCallback(
    (index: number, score: number) => {
      if (validatedRef.current[index]) return
      validatedRef.current[index] = true
      scoresRef.current.push(score)

      const count = validatedRef.current.filter(Boolean).length
      setValidCount(count)

      if (count === letters.length) {
        const all = scoresRef.current
        onComplete(Math.round(all.reduce((a, b) => a + b, 0) / all.length))
      }
    },
    [letters.length, onComplete],
  )

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-sm mx-auto px-4 pb-6">
      {/* Level · meaning */}
      <div className="flex items-center gap-2 text-sm">
        <span className={`font-semibold ${isDark ? "text-zinc-200" : "text-gray-800"}`}>
          {cfg.label}
        </span>
        <span className={isDark ? "text-zinc-600" : "text-gray-300"}>·</span>
        <span className={isDark ? "text-zinc-400" : "text-gray-500"}>{word.meaning}</span>
      </div>

      {/* Model word */}
      <div
        className={`text-4xl font-normal tracking-[0.18em] select-none ${isDark ? "text-zinc-500" : "text-gray-300"}`}
        style={{ fontFamily: "'Noto Sans', sans-serif" }}
      >
        {word.text}
      </div>

      {/* Progress */}
      <p className={`text-xs ${isDark ? "text-zinc-600" : "text-gray-400"}`}>
        {validCount}/{n} lettre{n > 1 ? "s" : ""} validée{n > 1 ? "s" : ""}
      </p>

      {/* Letter boxes — responsive grid */}
      <div
        ref={gridRef}
        className="w-full"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${perRow}, ${canvasSize}px)`,
          gap: `${GAP}px`,
          justifyContent: "center",
        }}
      >
        {letters.map((letter, i) => (
          <LetterBox
            key={i}
            index={i}
            letter={letter}
            paths={getPaths(letter)}
            canvasSize={canvasSize}
            cfg={cfg}
            isDark={isDark}
            onValid={handleLetterValid}
          />
        ))}
      </div>
    </div>
  )
}
