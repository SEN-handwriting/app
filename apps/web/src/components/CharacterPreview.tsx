"use client";

import type { Character } from "#/data/characters";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

export type CharacterPreviewHandle = {
  speak: () => void;
  replay: () => void;
};

interface CharacterPreviewProps {
  character: Character;
  showStrokes: boolean;
  size?: number;
  showLabel?: boolean;
  autoPlay?: boolean;
}

export default forwardRef<CharacterPreviewHandle, CharacterPreviewProps>(
  function CharacterPreview({ character, showStrokes, size = 300, showLabel = true, autoPlay = false }, ref) {
    const pathRefs = useRef<Array<SVGPathElement | null>>([]);
    const timeouts = useRef<number[]>([]);

    useEffect(() => {
      pathRefs.current.forEach(p => {
        if (!p) return;
        try {
          const len = p.getTotalLength();
          p.style.transition = "none";
          p.style.strokeDasharray = `${len}`;
          p.style.strokeDashoffset = `${len}`;
          p.getBoundingClientRect();
        } catch { /* SVG not in DOM yet */ }
      });

      if (autoPlay) {
        const id = window.setTimeout(() => playAnimation(), 50);
        timeouts.current.push(id);
      }

      return () => {
        timeouts.current.forEach(id => clearTimeout(id));
        timeouts.current = [];
      };
    }, [character.id, autoPlay]); // eslint-disable-line react-hooks/exhaustive-deps

    function playAnimation() {
      if (!pathRefs.current.length) return;
      timeouts.current.forEach(id => clearTimeout(id));
      timeouts.current = [];

      let delay = 0;
      pathRefs.current.forEach(p => {
        if (!p) return;
        try {
          const len = p.getTotalLength();
          p.style.transition = "none";
          p.style.strokeDasharray = `${len}`;
          p.style.strokeDashoffset = `${len}`;
          p.getBoundingClientRect();

          const id = window.setTimeout(() => {
            p.style.transition = "stroke-dashoffset 1000ms ease-in-out";
            p.style.strokeDashoffset = "0";
          }, delay);

          timeouts.current.push(id);
          delay += 1000;
        } catch { /* path not ready */ }
      });
    }

    function speak() {
      if (typeof window === "undefined") return;
      if (!("speechSynthesis" in window)) return;
      try {
        window.speechSynthesis.cancel();
        const ut = new SpeechSynthesisUtterance(
          character.audioText || character.label || "",
        );
        ut.lang = character.lang || "ja-JP";
        window.speechSynthesis.speak(ut);
      } catch { /* speech synthesis unavailable */ }
    }

    useImperativeHandle(ref, () => ({ replay: playAnimation, speak }));

    return (
      <div>
        <svg
          viewBox="0 0 109 109"
          width={size}
          height={size}
          style={{ border: "2px solid #ddd", background: "white" }}
        >
          {/* Grille de guidage */}
          <line
            x1="54.5"
            y1="0"
            x2="54.5"
            y2="109"
            stroke="#ddd"
            strokeWidth="1"
          />
          <line
            x1="0"
            y1="54.5"
            x2="109"
            y2="54.5"
            stroke="#ddd"
            strokeWidth="1"
          />

          {/* Affichage des traits */}
          {showStrokes &&
            character.svgPaths.map((d, i) => (
              <path
                key={i}
                d={d}
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="2.5"
                stroke="#000"
                fill="none"
                ref={el => {
                  pathRefs.current[i] = el;
                }}
              />
            ))}
        </svg>

        {showLabel && (
          <div style={{ marginTop: "10px" }}>
            <p style={{ fontSize: "18px", fontWeight: "bold" }}>
              {character.label}
            </p>
          </div>
        )}
      </div>
    );
  },
);