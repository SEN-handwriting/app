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
  /** When true, canvas fills its container width (square, responsive via ResizeObserver) */
  fluid?: boolean;
  onStrokeComplete?: (strokes: Array<{ x: number; y: number }[]>) => void;
  onStrokeStart?: (completedCount: number) => void;
  onRealtimeFeedback?: (point: { x: number; y: number }) => "on" | "near" | "off";
  borderColor?: string;
  /** SVG paths (109×109 viewBox) to draw as a guide on the canvas */
  guidePaths?: string[];
  /** Guide rendering mode */
  guideMode?: "full-thick" | "full" | "dotted-dense" | "dotted" | "dots";
}

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
    ctx.fillStyle = "#888888";
    for (const d of paths) {
      const dotPts = samplePathPoints(d, [0.1, 0.25, 0.5, 0.75, 0.9]);
      for (const pt of dotPts) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 5 / scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else {
    ctx.strokeStyle =
      mode === "full-thick" ? "#666666" :
      mode === "full"       ? "#999999" : "#bbbbbb";
    ctx.lineWidth =
      mode === "full-thick" ? 9 / scale : 4 / scale;
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
      fluid = false,
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
    const containerRef = useRef<HTMLDivElement | null>(null);
    const drawing = useRef(false);
    const last = useRef<{ x: number; y: number } | null>(null);
    const currentStroke = useRef<Array<{ x: number; y: number }>>([]);
    const allStrokes = useRef<Array<Array<{ x: number; y: number }>>>([]);
    const dprRef = useRef(1);
    const guidePathsRef = useRef(guidePaths);
    const guideModeRef = useRef(guideMode);

    // logicalSize = rendered canvas width (and height for square). 0 = not yet measured.
    const [logicalSize, setLogicalSize] = useState(fluid ? 0 : width);
    const logicalSizeRef = useRef(logicalSize);

    useEffect(() => { logicalSizeRef.current = logicalSize; }, [logicalSize]);
    useEffect(() => { guidePathsRef.current = guidePaths; }, [guidePaths]);
    useEffect(() => { guideModeRef.current = guideMode; }, [guideMode]);

    // Non-fluid: keep logicalSize in sync with the width prop (handles dynamic canvasSize from parent)
    useEffect(() => {
      if (!fluid) setLogicalSize(width);
    }, [fluid, width]);

    // Fluid: measure container on mount and on resize
    useEffect(() => {
      if (!fluid) return;
      const el = containerRef.current;
      if (!el) return;
      const ro = new ResizeObserver((entries) => {
        const w = entries[0]?.contentRect.width;
        if (w && w > 0) setLogicalSize(Math.floor(w));
      });
      ro.observe(el);
      return () => ro.disconnect();
    }, [fluid]);

    useImperativeHandle(ref, () => ({
      clear: () => {
        const c = canvasRef.current;
        if (!c) return;
        const ctx = c.getContext("2d");
        if (!ctx) return;
        const dpr = dprRef.current;
        const ls = logicalSizeRef.current;
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        paintGuide(ctx, guidePathsRef.current, guideModeRef.current, ls);
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

    // Canvas setup — re-runs whenever logicalSize changes (fluid resize or width prop update)
    useEffect(() => {
      if (logicalSize === 0) return;
      const c = canvasRef.current;
      if (!c) return;
      const dpr = window.devicePixelRatio || 1;
      dprRef.current = dpr;
      const h = fluid ? logicalSize : height;
      c.width = logicalSize * dpr;
      c.height = h * dpr;
      c.style.width = `${logicalSize}px`;
      c.style.height = `${h}px`;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 3;
      paintGuide(ctx, guidePaths, guideMode, logicalSize);
      currentStroke.current = [];
      allStrokes.current = [];
    }, [logicalSize]); // eslint-disable-line react-hooks/exhaustive-deps

    // Redraw guide when guidePaths or guideMode changes (level progression)
    const guideKey = `${guideMode ?? "none"}::${guidePaths?.join("|") ?? ""}`;
    useEffect(() => {
      const ls = logicalSizeRef.current;
      if (ls === 0) return;
      const c = canvasRef.current;
      if (!c) return;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      const dpr = dprRef.current;
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paintGuide(ctx, guidePaths, guideMode, ls);
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

    // Percentage-based grid lines — adapt to any canvas size without pixel math
    const gridLines = (
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
          width: "100%",
          height: "100%",
        }}
      >
        <line x1="50" y1="0" x2="50" y2="100" stroke="#f0f0f0" strokeWidth="0.3" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="#f0f0f0" strokeWidth="0.3" />
        <line x1="25" y1="0" x2="25" y2="100" stroke="#f8f8f8" strokeWidth="0.3" />
        <line x1="75" y1="0" x2="75" y2="100" stroke="#f8f8f8" strokeWidth="0.3" />
        <line x1="0" y1="25" x2="100" y2="25" stroke="#f8f8f8" strokeWidth="0.3" />
        <line x1="0" y1="75" x2="100" y2="75" stroke="#f8f8f8" strokeWidth="0.3" />
      </svg>
    );

    const canvas = (
      <canvas
        ref={canvasRef}
        style={{
          border: `3px solid ${borderColor}`,
          display: "block",
          touchAction: "none",
          cursor: "crosshair",
          background: "white",
          transition: "border-color 0.3s ease",
        }}
      />
    );

    if (fluid) {
      return (
        <div
          ref={containerRef}
          style={{
            width: "100%",
            position: "relative",
            // Hold space before first ResizeObserver measurement
            ...(logicalSize === 0 ? { aspectRatio: "1 / 1" } : {}),
          }}
        >
          {canvas}
          {gridLines}
        </div>
      );
    }

    return (
      <div style={{ position: "relative", display: "inline-block" }}>
        {canvas}
        {gridLines}
      </div>
    );
  },
);
