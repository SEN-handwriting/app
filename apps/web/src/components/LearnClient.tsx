"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CharacterPreview, { CharacterPreviewHandle } from "./CharacterPreview";
import DrawCanvas, { DrawCanvasHandle } from "./DrawCanvas";
import { characters } from "../data/characters";
import type { Character } from "../data/characters";

export default function LearnClient({ initialLang, initialId }: { initialLang?: string; initialId?: string }) {
  const router = useRouter();
  const fallbackId = characters[0]?.id ?? "";
  const [selectedId, setSelectedId] = useState<string>(
    initialId ?? characters.find((c) => c.lang === initialLang)?.id ?? fallbackId,
  );
  const [difficultyLevel, setDifficultyLevel] = useState<number>(1);

  const previewRef = useRef<CharacterPreviewHandle | null>(null);
  const drawRef = useRef<DrawCanvasHandle | null>(null);

  const selected = (characters.find((c) => c.id === selectedId) ?? characters[0]) as Character;

  useEffect(() => {
    // replay and clear on initial mount
    setTimeout(() => previewRef.current?.replay(), 50);
    drawRef.current?.clear();
  }, [selectedId]);

  function onSelect(id: string) {
    const c = characters.find((x) => x.id === id) ?? characters[0]!;
    setSelectedId(id);
    // navigate to slugged route for shareable URL
    router.push(`/langue/${encodeURIComponent(c.lang ?? "en-US")}/${encodeURIComponent(id)}/learn`);
    setTimeout(() => previewRef.current?.replay(), 50);
    drawRef.current?.clear();
  }

  return (
    <div>
      <section className="mb-6">
        <div className="flex gap-2">
          {characters.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`px-3 py-2 border rounded ${c.id === selectedId ? "bg-black text-white" : ""}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <CharacterPreview ref={previewRef} character={selected} difficultyLevel={difficultyLevel} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Espace de dessin</h2>
            <div className="flex gap-2">
              <button onClick={() => previewRef.current?.replay()} className="px-3 py-1 border rounded">Rejouer traits</button>
              <button onClick={() => previewRef.current?.speak()} className="px-3 py-1 border rounded">Écouter</button>
              <button onClick={() => drawRef.current?.clear()} className="px-3 py-1 border rounded">Effacer</button>
            </div>
          </div>

          <DrawCanvas ref={drawRef} width={360} height={360} />
        </div>
      </section>
    </div>
  );
}
