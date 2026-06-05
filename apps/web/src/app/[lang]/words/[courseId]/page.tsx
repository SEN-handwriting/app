"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import WordPracticeGrid from "../../../../components/WordPracticeGrid"
import PracticeGrid from "../../../../components/PracticeGrid"
import CharacterPreviewRaw from "../../../../components/CharacterPreview"
import type { Character } from "../../../../data/characters"

// Cast to avoid forwardRef JSX type conflict in [lang] dynamic routes
const CharacterPreview = CharacterPreviewRaw as unknown as React.FC<{
  character: Character; showStrokes: boolean; size?: number; showLabel?: boolean; autoPlay?: boolean
}>

interface KanjiComponent { char: string; meaning: string }

interface Word {
  id: string
  text: string
  kana: string | null
  reading: string | null
  meaning: string
  audioText: string | null
  courseLevel: number
  lang: string
  etymology: string | null
  components: KanjiComponent[] | null
}

function speak(text: string, lang: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = lang
  utt.rate = 0.85
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utt)
}

// ── Pratique écriture caractère par caractère ────────────────────────────────

function WritingPractice({ word, onBack, onComplete }: {
  word: Word
  onBack: () => void
  onComplete: () => void
}) {
  const [characters, setCharacters] = useState<Character[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [charIndex, setCharIndex] = useState(0)
  const [successCount, setSuccessCount] = useState(0)
  const [replayKey, setReplayKey] = useState(0)
  const [showInfo, setShowInfo] = useState(false)

  useEffect(() => { setSuccessCount(0); setReplayKey(k => k + 1) }, [charIndex])

  useEffect(() => {
    const chars = [...word.text]
    const seen = new Set<string>()
    const unique = chars.filter(k => { if (seen.has(k)) return false; seen.add(k); return true })
    if (!unique.length) { setIsLoading(false); return }
    fetch(`/api/characters?lang=${word.lang}&labels=${encodeURIComponent(unique.join(","))}`)
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
  }, [word.id, word.text, word.lang])

  if (isLoading) return <div className="text-zinc-400 py-10 text-center text-sm">Chargement…</div>

  if (!characters.length) return (
    <div className="text-center space-y-4 py-8">
      <p className="text-zinc-500 text-sm">Aucun caractère trouvé — lance d'abord le seed kanji.</p>
      <button onClick={onBack} className="px-4 py-2 rounded-xl bg-zinc-800 text-sm hover:bg-zinc-700 transition-colors">← Retour</button>
    </div>
  )

  if (charIndex >= characters.length) return (
    <div className="flex flex-col items-center gap-6 py-8">
      <p className="text-4xl">🎉</p>
      <p className="font-semibold text-lg">Mot pratiqué !</p>
      <button onClick={onComplete} className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white transition-colors">
        Mot suivant →
      </button>
    </div>
  )

  const current = characters[charIndex]!

  return (
    <>
      {/* Header avec titre du mot + ℹ️ */}
      <div className="flex items-center justify-between mb-4 px-1">
        <button onClick={onBack} className="text-sm text-zinc-400 hover:text-white transition-colors py-1">← Retour</button>
        <div className="text-center">
          <p className="text-3xl font-bold">{word.text}</p>
          {word.kana && <p className="text-sm text-zinc-400 mt-0.5">{word.kana}</p>}
        </div>
        <button
          onClick={() => setShowInfo(true)}
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-zinc-700 text-zinc-400 hover:bg-zinc-800 transition-colors"
        >
          ℹ️
        </button>
      </div>

      {/* Indicateur de caractère */}
      {characters.length > 1 && (
        <p className="text-center text-xs text-zinc-600 mb-3">
          Caractère {charIndex + 1} / {characters.length}
        </p>
      )}

      {/* Preview + replay */}
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

      {/* Canvas */}
      <PracticeGrid
        key={current.id}
        character={current}
        initialLevel={1}
        onSuccess={() => setSuccessCount(n => n + 1)}
      />

      {/* Banner succès */}
      {successCount >= 2 && (
        <div className="flex items-center justify-between rounded-xl border border-green-800 bg-green-950 px-5 py-3">
          <span className="text-green-400 font-medium text-sm">✓ Bien joué !</span>
          <button
            onClick={() => setCharIndex(i => i + 1)}
            className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors font-medium text-sm"
          >
            {charIndex + 1 < characters.length ? "Caractère suivant →" : "Terminer →"}
          </button>
        </div>
      )}

      {/* Info bottom sheet */}
      {showInfo && (
        <div className="fixed inset-0 z-[80] bg-black/60" onClick={() => setShowInfo(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-700 rounded-t-2xl px-5 pt-5 pb-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="font-semibold text-lg">{word.text}</span>
                {word.kana && <span className="text-zinc-400 ml-2 text-sm">{word.kana}</span>}
              </div>
              <button onClick={() => setShowInfo(false)} className="text-zinc-400 hover:text-white text-xl w-8 h-8 flex items-center justify-center">✕</button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <span className="text-zinc-500 w-20 shrink-0">Sens</span>
                <span className="text-zinc-200">{word.meaning}</span>
              </div>
              {word.reading && (
                <div className="flex gap-3">
                  <span className="text-zinc-500 w-20 shrink-0">Lecture</span>
                  <span className="text-zinc-200">{word.reading}</span>
                </div>
              )}
              {word.etymology && (
                <div className="flex gap-3">
                  <span className="text-zinc-500 w-20 shrink-0">Étymologie</span>
                  <span className="text-zinc-200 leading-relaxed">{word.etymology}</span>
                </div>
              )}
              {word.components && word.components.length > 0 && (
                <div className="flex gap-3">
                  <span className="text-zinc-500 w-20 shrink-0">Composants</span>
                  <div className="flex gap-2 flex-wrap">
                    {word.components.map((c, i) => (
                      <div key={i} className="flex flex-col items-center px-2.5 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700">
                        <span className="text-xl">{c.char}</span>
                        <span className="text-[10px] text-zinc-500 mt-0.5">{c.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Fiche kanji (japonais) ────────────────────────────────────────────────────

function KanjiCard({ word, index, total, onKnow, onAgain, onPrev, onNext }: {
  word: Word
  index: number
  total: number
  onKnow: () => void
  onAgain: () => void
  onPrev: () => void
  onNext: () => void
}) {
  const [flipped, setFlipped] = useState(false)
  const [writing, setWriting] = useState(false)

  useEffect(() => { setFlipped(false); setWriting(false) }, [word.id])

  if (writing) return (
    <WritingPractice
      word={word}
      onBack={() => setWriting(false)}
      onComplete={() => { setWriting(false); onKnow() }}
    />
  )

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md">
      {/* Flashcard */}
      <div
        onClick={() => setFlipped((f) => !f)}
        className="w-full min-h-64 rounded-2xl border border-zinc-700 bg-zinc-900 flex flex-col items-center justify-center gap-3 p-8 cursor-pointer select-none active:scale-[0.98] transition-transform"
      >
        {/* Kanji */}
        <p className="text-7xl font-bold leading-none" style={{ fontFamily: "'Noto Serif JP', serif" }}>
          {word.text}
        </p>

        {/* Kana */}
        {word.kana && (
          <p className="text-xl text-zinc-400">{word.kana}</p>
        )}

        {/* Flip hint / détails */}
        {!flipped ? (
          <p className="text-xs text-zinc-600 mt-2">Appuie pour voir le sens</p>
        ) : (
          <div className="w-full border-t border-zinc-700 pt-4 mt-2 space-y-4">
            {/* Romaji + sens */}
            <div className="flex items-center justify-center gap-3 text-center">
              {word.reading && (
                <span className="text-sm text-zinc-500 italic">{word.reading}</span>
              )}
              <span className="text-zinc-600">·</span>
              <span className="text-lg text-indigo-300 font-semibold">{word.meaning}</span>
            </div>

            {/* Différentes écritures */}
            <div className="flex gap-2 justify-center flex-wrap">
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-sm text-zinc-300 font-medium">{word.text}</span>
              {word.kana && word.kana !== word.text && (
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-sm text-zinc-400">{word.kana}</span>
              )}
              {word.reading && (
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-sm text-zinc-500 italic">{word.reading}</span>
              )}
            </div>

            {/* Étymologie */}
            {word.etymology && (
              <div className="text-center">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Étymologie</p>
                <p className="text-sm text-zinc-300 leading-relaxed">{word.etymology}</p>
              </div>
            )}

            {/* Composants */}
            {word.components && word.components.length > 0 && (
              <div className="text-center">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Composants</p>
                <div className="flex gap-2 justify-center flex-wrap">
                  {word.components.map((c, i) => (
                    <div key={i} className="flex flex-col items-center px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700">
                      <span className="text-2xl" style={{ fontFamily: "'Noto Serif JP', serif" }}>{c.char}</span>
                      <span className="text-[10px] text-zinc-500 mt-0.5">{c.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* TTS + écriture */}
      <div className="flex gap-3">
        <button
          onClick={() => speak(word.audioText ?? word.kana ?? word.text, word.lang)}
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

      {/* Actions (après flip) */}
      {flipped && (
        <div className="flex gap-3 w-full">
          <button
            onClick={onAgain}
            className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-colors"
          >
            À revoir
          </button>
          <button
            onClick={onKnow}
            className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
          >
            ✓ Acquis
          </button>
        </div>
      )}

      {/* Prev / Next */}
      <div className="flex gap-4">
        <button
          onClick={onPrev}
          disabled={index === 0}
          className="px-4 py-2 rounded-lg text-sm text-zinc-500 disabled:opacity-30 hover:text-zinc-300 transition-colors"
        >
          ← Précédent
        </button>
        <button
          onClick={onNext}
          disabled={index === total - 1}
          className="px-4 py-2 rounded-lg text-sm text-zinc-500 disabled:opacity-30 hover:text-zinc-300 transition-colors"
        >
          Suivant →
        </button>
      </div>
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function WordPracticePage() {
  const params = useParams<{ lang: string; courseId: string }>()
  const router = useRouter()

  const [words, setWords]         = useState<Word[]>([])
  const [wordIndex, setWordIndex] = useState(0)
  const [level, setLevel]         = useState(1)
  const [known, setKnown]         = useState<Set<number>>(new Set())
  const [loading, setLoading]     = useState(true)

  const isJapanese = params.lang === "ja-JP"

  useEffect(() => {
    fetch(`/api/words?lang=${params.lang}&level=${params.courseId}`)
      .then((r) => r.json())
      .then((data: Word[]) => { setWords(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [params.lang, params.courseId])

  const handleKnow = useCallback(() => {
    setKnown((prev) => new Set([...prev, wordIndex]))
    const next = wordIndex + 1
    if (next < words.length) { setWordIndex(next) } else { router.push("/dashboard") }
  }, [wordIndex, words.length, router])

  const handleAgain = useCallback(() => {
    const next = wordIndex + 1
    setWordIndex(next < words.length ? next : 0)
  }, [wordIndex, words.length])

  const handleComplete = useCallback(async () => {
    const next = wordIndex + 1
    if (next < words.length) { setWordIndex(next) } else { router.push("/dashboard") }
  }, [wordIndex, words.length, router])

  const handlePrev = useCallback(() => {
    if (wordIndex > 0) setWordIndex(wordIndex - 1)
  }, [wordIndex])

  const handleNext = useCallback(() => {
    if (wordIndex < words.length - 1) setWordIndex(wordIndex + 1)
  }, [wordIndex, words.length])

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950">
      <p className="text-zinc-400 text-sm">Chargement…</p>
    </div>
  )

  if (!words.length) return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950">
      <p className="text-zinc-400 text-sm">Aucun mot trouvé.</p>
    </div>
  )

  const currentWord = words[wordIndex]
  if (!currentWord) return null

  const progress = known.size
  const total    = words.length

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-zinc-800">
        <div
          className="h-1 bg-indigo-500 transition-all duration-300"
          style={{ width: `${((wordIndex + 1) / total) * 100}%` }}
        />
      </div>

      {/* Contenu */}
      {isJapanese ? (
        <div className="flex-1 flex flex-col px-4 py-6 max-w-md mx-auto w-full">
          <WritingPractice
            key={wordIndex}
            word={currentWord}
            onBack={() => router.back()}
            onComplete={handleKnow}
          />
        </div>
      ) : (
        <>
          {/* Sélecteur d'étape (tracé russe) */}
          <div className="flex gap-2 justify-center pt-4 flex-wrap px-4">
            {[1, 2, 3, 4, 5, 6].map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={[
                  "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                  level === l
                    ? "bg-blue-500 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700",
                ].join(" ")}
              >
                Étape {l}
              </button>
            ))}
          </div>
          <div className="flex-1 flex items-start justify-center pt-6">
            <WordPracticeGrid
              key={`${currentWord.id}-${level}`}
              word={currentWord}
              level={level}
              lang={params.lang}
              variant="dark"
              onComplete={handleComplete}
            />
          </div>
        </>
      )}
    </main>
  )
}
