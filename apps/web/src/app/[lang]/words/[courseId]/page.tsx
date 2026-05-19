"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import WordPracticeGrid from "../../../../components/WordPracticeGrid"

interface Word {
  id: string
  text: string
  reading: string
  meaning: string
  audioText: string
  courseLevel: number
  lang: string
}

export default function WordPracticePage() {
  const params = useParams<{ lang: string; courseId: string }>()
  const router = useRouter()

  const [words, setWords] = useState<Word[]>([])
  const [wordIndex, setWordIndex] = useState(0)
  const [level, setLevel] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/words?lang=${params.lang}&level=${params.courseId}`)
      .then((r) => r.json())
      .then((data: Word[]) => {
        setWords(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.lang, params.courseId])

  const handleComplete = async (score: number) => {
    const next = wordIndex + 1
    if (next < words.length) {
      setWordIndex(next)
    } else {
      router.push("/dashboard")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-400 text-sm">Chargement…</p>
      </div>
    )
  }

  if (!words.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-400 text-sm">Aucun mot trouvé.</p>
      </div>
    )
  }

  const currentWord = words[wordIndex]

  if (!currentWord) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-400 text-sm">Mot introuvable.</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-6 pb-2">
        <button
          onClick={() => router.back()}
          className="text-sm text-zinc-400 hover:text-white transition-colors"
        >
          ← Retour
        </button>
        <span className="text-sm text-zinc-500">
          {wordIndex + 1} / {words.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-zinc-800">
        <div
          className="h-1 bg-green-500 transition-all"
          style={{ width: `${((wordIndex + 1) / words.length) * 100}%` }}
        />
      </div>

      {/* Level selector */}
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

      {/* Practice */}
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
    </main>
  )
}
