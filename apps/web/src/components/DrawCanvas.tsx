"use client";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { samplePathPoints } from "../lib/stroke-validator";

export type DrawCanvasHandle = {
  clear: () => void;
  getImageData: () => ImageData | null;
};

interface DrawCanvasProps {
  width?: number;
  height?: number;
  onStrokeComplete?: (strokes: Array<{ x: number; y: number }[]>) => void;
  onStrokeStart?: (completedCount: number) => void;
  onRealtimeFeedback?: (point: { x: number; y: number }) => "on" | "near" | "off";
  borderColor?: string;
  /** SVG paths (109×109 viewBox) to draw as a guide on the canvas */
  guidePaths?: string[];
  /** Guide rendering mode */
  guideMode?: "full-thick" | "full" | "dotted-dense" | "dotted" | "dots";
}

// Draws guide paths directly on the canvas context (behind user strokes).
// paths are in 109×109 SVG space; we scale to the canvas logical size.
function paintGuide(
  ctx: CanvasRenderingContext2D,
  paths: string[] | undefined,
  mode: "full-thick" | "full" | "dotted-dense" | "dotted" | "dots" | undefined,
  logicalWidth: number,
) {
  if (!paths || paths.length === 0 || !mode) return;
  const scale = logicalWidth / 109;
  ctx.save();
  ctx.scale(scale, scale);

  if (mode === "dots") {
    ctx.fillStyle = "#c0c0c0";
    for (const d of paths) {
      const dotPts = samplePathPoints(d, [0.1, 0.25, 0.5, 0.75, 0.9]);
      for (const pt of dotPts) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4 / scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else {
    ctx.strokeStyle =
      mode === "full-thick" ? "#aaaaaa" :
      mode === "full"       ? "#cccccc" : "#e0e0e0";
    ctx.lineWidth =
      mode === "full-thick" ? 8 / scale : 3 / scale;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.setLineDash(
      mode === "dotted-dense" ? [4 / scale, 4 / scale] :
      mode === "dotted"       ? [5 / scale, 5 / scale] : [],
    );
    for (const d of paths) {
      try { ctx.stroke(new Path2D(d)); } catch { /* ignore malformed */ }
    }
  }

  ctx.restore();
}

export default forwardRef<DrawCanvasHandle, DrawCanvasProps>(
  function DrawCanvas(
    {
      width = 300,
      height = 300,
      onStrokeComplete,
      onStrokeStart,
      onRealtimeFeedback,
      borderColor = "#ddd",
      guidePaths,
      guideMode,
    },
    ref,
  ) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const drawing = useRef(false);
    const last = useRef<{ x: number; y: number } | null>(null);
    const currentStroke = useRef<Array<{ x: number; y: number }>>([]);
    const allStrokes = useRef<Array<Array<{ x: number; y: number }>>>([]);
    const dprRef = useRef(1);
    // Keep latest guide props accessible in imperative handle
    const guidePathsRef = useRef(guidePaths);
    const guideModeRef = useRef(guideMode);
    const [size] = useState({ w: width, h: height });

    useEffect(() => {
      guidePathsRef.current = guidePaths;
    }, [guidePaths]);
    useEffect(() => {
      guideModeRef.current = guideMode;
    }, [guideMode]);

    useImperativeHandle(ref, () => ({
      clear: () => {
        const c = canvasRef.current;
        if (!c) return;
        const ctx = c.getContext("2d");
        if (!ctx) return;
        const dpr = dprRef.current;
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        paintGuide(ctx, guidePathsRef.current, guideModeRef.current, size.w);
        currentStroke.current = [];
        allStrokes.current = [];
      },
      getImageData: () => {
        const c = canvasRef.current;
        if (!c) return null;
        const ctx = c.getContext("2d");
        if (!ctx) return null;
        return ctx.getImageData(0, 0, c.width, c.height);
      },
    }));

    // Initial canvas setup (runs once)
    useEffect(() => {
      const c = canvasRef.current;
      if (!c) return;
      const dpr = window.devicePixelRatio || 1;
      dprRef.current = dpr;
      c.width = size.w * dpr;
      c.height = size.h * dpr;
      c.style.width = `${size.w}px`;
      c.style.height = `${size.h}px`;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 3;
      paintGuide(ctx, guidePaths, guideMode, size.w);
    }, [size]); // eslint-disable-line react-hooks/exhaustive-deps

    // Redraw guide when guidePaths or guideMode changes (mode progression)
    const guideKey = `${guideMode ?? "none"}::${guidePaths?.join("|") ?? ""}`;
    useEffect(() => {
      const c = canvasRef.current;
      if (!c) return;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      const dpr = dprRef.current;
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paintGuide(ctx, guidePaths, guideMode, size.w);
      currentStroke.current = [];
      allStrokes.current = [];
    }, [guideKey]); // eslint-disable-line react-hooks/exhaustive-deps

    function getPos(e: PointerEvent) {
      const rect = canvasRef.current!.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    useEffect(() => {
      const c = canvasRef.current;
      if (!c) return;

      const REALTIME_COLORS = { on: "#22c55e", near: "#f59e0b", off: "#ef4444" } as const;

      const onPointerDown = (ev: PointerEvent) => {
        drawing.current = true;
        try { c.setPointerCapture(ev.pointerId); } catch {}
        const pos = getPos(ev);
        last.current = pos;
        currentStroke.current = [pos];
        onStrokeStart?.(allStrokes.current.length);
      };

      const onPointerMove = (ev: PointerEvent) => {
        if (!drawing.current || !last.current) return;
        const p = getPos(ev);
        const ctx = c.getContext("2d");
        if (!ctx) return;

        if (onRealtimeFeedback) {
          const status = onRealtimeFeedback(p);
          ctx.strokeStyle = REALTIME_COLORS[status];
        } else {
          ctx.strokeStyle = "#000";
        }

        ctx.beginPath();
        ctx.moveTo(last.current.x, last.current.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        last.current = p;
        currentStroke.current.push(p);
      };

      const onPointerUp = (ev: PointerEvent) => {
        if (drawing.current && currentStroke.current.length > 0) {
          allStrokes.current.push([...currentStroke.current]);
          onStrokeComplete?.(allStrokes.current);
        }
        drawing.current = false;
        try { c.releasePointerCapture(ev.pointerId); } catch {}
        last.current = null;
        currentStroke.current = [];
        // Reset to default color for next stroke
        const ctx = c.getContext("2d");
        if (ctx) ctx.strokeStyle = "#000";
      };

      c.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);

      return () => {
        c.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
      };
    }, [onStrokeComplete, onStrokeStart, onRealtimeFeedback]);

    return (
      <div style={{ position: "relative", display: "inline-block" }}>
        <canvas
          ref={canvasRef}
          width={size.w}
          height={size.h}
          style={{
            border: `3px solid ${borderColor}`,
            display: "block",
            touchAction: "none",
            cursor: "crosshair",
            background: "white",
            transition: "border-color 0.3s ease",
          }}
        />
        {/* Grid lines overlay (always on top, very subtle) */}
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            pointerEvents: "none",
            width: width,
            height: height,
          }}
        >
          <line x1={width / 2} y1="0" x2={width / 2} y2={height} stroke="#f0f0f0" strokeWidth="1" />
          <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#f0f0f0" strokeWidth="1" />
          <line x1={width / 4} y1="0" x2={width / 4} y2={height} stroke="#f8f8f8" strokeWidth="1" />
          <line x1={(3 * width) / 4} y1="0" x2={(3 * width) / 4} y2={height} stroke="#f8f8f8" strokeWidth="1" />
          <line x1="0" y1={height / 4} x2={width} y2={height / 4} stroke="#f8f8f8" strokeWidth="1" />
          <line x1="0" y1={(3 * height) / 4} x2={width} y2={(3 * height) / 4} stroke="#f8f8f8" strokeWidth="1" />
        </svg>
      </div>
    );
  },
);
