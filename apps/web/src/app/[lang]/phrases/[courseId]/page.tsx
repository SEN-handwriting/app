"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import PracticeGrid from "../../../../components/PracticeGrid"
import CharacterPreviewRaw from "../../../../components/CharacterPreview"
import type { Character } from "../../../../data/characters"

const CharacterPreview = CharacterPreviewRaw as unknown as React.FC<{
  character: Character; showStrokes: boolean; size?: number; showLabel?: boolean; autoPlay?: boolean
}>

interface Phrase {
  id: string
  text: string
  reading: string | null
  translation: string
  audioText: string | null
  courseLevel: number
  lang: string
}

function speak(text: string, lang: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = lang
  utt.rate = 0.85
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utt)
}

// ── Pratique écriture caractère par caractère ─────────────────────────────────

function WritingPractice({ phrase, onBack, onComplete }: {
  phrase: Phrase
  onBack: () => void
  onComplete: () => void
}) {
  const [characters, setCharacters] = useState<Character[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [charIndex, setCharIndex] = useState(0)
  const [successCount, setSuccessCount] = useState(0)
  const [replayKey, setReplayKey] = useState(0)

  useEffect(() => { setSuccessCount(0); setReplayKey(k => k + 1) }, [charIndex])

  useEffect(() => {
    const source = phrase.text
    const chars = [...source]
    const seen = new Set<string>()
    const unique = chars.filter(k => { if (seen.has(k)) return false; seen.add(k); return true })
    if (!unique.length) { setIsLoading(false); return }
    fetch(`/api/characters?lang=${phrase.lang}&labels=${encodeURIComponent(unique.join(","))}`)
      .then(r => r.json())
      .then((data: Character[]) => {
        const byLabel = new Map(data.map(c => [c.label, c]))
        const ordered: Character[] = []
        const added = new Set<string>()
        for (const k of chars) {
          if (!added.has(k) && byLabel.has(k)) { added.add(k); ordered.push(byLabel.get(k)!) }
        }
        setCharacters(ordered)
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [phrase.id, phrase.text, phrase.lang])

  if (isLoading) return <div className="text-zinc-400 py-10 text-center text-sm">Chargement…</div>

  if (!characters.length) return (
    <div className="text-center space-y-4 py-8">
      <p className="text-zinc-500 text-sm">Aucun caractère à pratiquer pour cette phrase.</p>
      <button onClick={onBack} className="px-4 py-2 rounded-xl bg-zinc-800 text-sm hover:bg-zinc-700 transition-colors">← Retour</button>
    </div>
  )

  if (charIndex >= characters.length) return (
    <div className="flex flex-col items-center gap-6 py-8">
      <p className="text-4xl">🎉</p>
      <p className="font-semibold text-lg">Phrase pratiquée !</p>
      <div className="flex gap-3">
        <button onClick={onBack} className="px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors">← Retour</button>
        <button onClick={onComplete} className="px-5 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-sm font-semibold text-white transition-colors">Phrase suivante →</button>
      </div>
    </div>
  )

  const current = characters[charIndex]!

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-zinc-400 hover:text-white transition-colors">← Retour</button>
        <span className="text-sm text-zinc-500">{charIndex + 1} / {characters.length}</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <CharacterPreview key={replayKey} character={current} showStrokes autoPlay size={160} showLabel={false} />
        <div className="flex items-center gap-3">
          {current.romaji?.[0] && <span className="text-sm text-zinc-500">{current.romaji[0]}</span>}
          <button
            onClick={() => setReplayKey(k => k + 1)}
            className="px-3 py-1.5 rounded-lg border border-zinc-700 text-xs hover:bg-zinc-800 transition-colors"
          >
            ▶ Rejouer
          </button>
        </div>
      </div>
      <PracticeGrid
        key={current.id}
        character={current}
        initialLevel={1}
        onSuccess={() => setSuccessCount(n => n + 1)}
      />
      {successCount >= 2 && (
        <div className="flex items-center justify-between rounded-xl border border-green-800 bg-green-950 px-5 py-3">
          <span className="text-green-400 font-medium text-sm">✓ Maîtrisé !</span>
          <button
            onClick={() => setCharIndex(i => i + 1)}
            className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors font-medium text-sm"
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function PhrasePracticePage() {
  const params = useParams<{ lang: string; courseId: string }>()
  const router = useRouter()

  const [phrases, setPhrases] = useState<Phrase[]>([])
  const [index, setIndex]     = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [loading, setLoading] = useState(true)
  const [known, setKnown]     = useState<Set<number>>(new Set())
  const [writing, setWriting] = useState(false)

  useEffect(() => {
    fetch(`/api/phrases?lang=${params.lang}&level=${params.courseId}`)
      .then((r) => r.json())
      .then((data: Phrase[]) => {
        setPhrases(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.lang, params.courseId])

  const current = phrases[index]

  const handleFlip = useCallback(() => setFlipped((f) => !f), [])

  const handleKnow = useCallback(() => {
    setKnown((prev) => new Set([...prev, index]))
    const next = index + 1
    if (next < phrases.length) {
      setIndex(next)
      setFlipped(false)
    } else {
      router.push("/dashboard")
    }
  }, [index, phrases.length, router])

  const handleAgain = useCallback(() => {
    const next = index + 1
    if (next < phrases.length) {
      setIndex(next)
    } else {
      setIndex(0)
    }
    setFlipped(false)
  }, [index, phrases.length])

  const handlePrev = useCallback(() => {
    if (index > 0) {
      setIndex(index - 1)
      setFlipped(false)
    }
  }, [index])

  const handleNext = useCallback(() => {
    if (index < phrases.length - 1) {
      setIndex(index + 1)
      setFlipped(false)
    }
  }, [index, phrases.length])

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950">
      <p className="text-zinc-400 text-sm">Chargement…</p>
    </div>
  )

  if (!phrases.length) return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950">
      <p className="text-zinc-400 text-sm">Aucune phrase trouvée.</p>
    </div>
  )

  if (!current) return null

  const progress = known.size
  const total    = phrases.length

  if (writing) return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 py-8">
      <WritingPractice
        phrase={current}
        onBack={() => setWriting(false)}
        onComplete={() => { setWriting(false); handleKnow() }}
      />
    </main>
  )

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-6 pb-2">
        <button
          onClick={() => router.back()}
          className="text-sm text-zinc-400 hover:text-white transition-colors"
        >
          ← Retour
        </button>
        <span className="text-sm text-zinc-500">
          {index + 1} / {total} · {progress} acquise{progress > 1 ? "s" : ""}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-zinc-800">
        <div
          className="h-1 bg-indigo-500 transition-all duration-300"
          style={{ width: `${(progress / total) * 100}%` }}
        />
      </div>

      {/* Card area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-6">

        {/* Flashcard */}
        <div
          onClick={handleFlip}
          className="w-full max-w-md min-h-56 rounded-2xl border border-zinc-700 bg-zinc-900 flex flex-col items-center justify-center gap-4 p-8 cursor-pointer select-none active:scale-[0.98] transition-transform"
        >
          {/* Phrase */}
          <p
            className="text-center leading-relaxed text-zinc-100"
            style={{
              fontSize: current.text.length > 20 ? "1.6rem" : "2.2rem",
              fontFamily: "'Noto Sans', sans-serif",
            }}
          >
            {current.text}
          </p>

          {/* Reading */}
          {current.reading && (
            <p className="text-base text-zinc-500 text-center italic">
              {current.reading}
            </p>
          )}

          {/* Translation reveal */}
          {flipped ? (
            <div className="w-full border-t border-zinc-700 pt-4 mt-2 text-center">
              <p className="text-lg text-indigo-300 font-medium">{current.translation}</p>
            </div>
          ) : (
            <p className="text-xs text-zinc-600 mt-2">Appuie pour voir la traduction</p>
          )}
        </div>

        {/* TTS + écriture */}
        <div className="flex gap-3">
          <button
            onClick={() => speak(current.audioText ?? current.text, current.lang)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors"
          >
            🔊 Écouter
          </button>
          <button
            onClick={() => setWriting(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors"
          >
            ✏️ Écrire
          </button>
        </div>

        {/* Action buttons (shown after flip) */}
        {flipped && (
          <div className="flex gap-3 w-full max-w-xs">
            <button
              onClick={handleAgain}
              className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-colors"
            >
              À revoir
            </button>
            <button
              onClick={handleKnow}
              className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition-colors"
            >
              ✓ Acquis
            </button>
          </div>
        )}

        {/* Navigation prev / next */}
        <div className="flex gap-4 mt-2">
          <button
            onClick={handlePrev}
            disabled={index === 0}
            className="px-4 py-2 rounded-lg text-sm text-zinc-500 disabled:opacity-30 hover:text-zinc-300 transition-colors"
          >
            ← Précédent
          </button>
          <button
            onClick={handleNext}
            disabled={index === phrases.length - 1}
            className="px-4 py-2 rounded-lg text-sm text-zinc-500 disabled:opacity-30 hover:text-zinc-300 transition-colors"
          >
            Suivant →
          </button>
        </div>
      </div>
    </main>
  )
}
