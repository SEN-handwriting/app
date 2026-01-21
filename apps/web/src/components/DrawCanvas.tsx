"use client";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

export type DrawCanvasHandle = {
  clear: () => void;
  getImageData: () => ImageData | null;
};

interface DrawCanvasProps {
  width?: number;
  height?: number;
  onStrokeComplete?: (strokes: Array<{x: number, y: number}[]>) => void;
  borderColor?: string;
}

export default forwardRef<DrawCanvasHandle, DrawCanvasProps>(
  function DrawCanvas({ width = 300, height = 300, onStrokeComplete, borderColor = "#ddd" }, ref) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const drawing = useRef(false);
    const last = useRef<{ x: number; y: number } | null>(null);
    const currentStroke = useRef<Array<{x: number, y: number}>>([]);
    const allStrokes = useRef<Array<Array<{x: number, y: number}>>>([]);
    const [size] = useState({ w: width, h: height });

    useImperativeHandle(ref, () => ({
      clear: () => {
        const c = canvasRef.current;
        if (!c) return;
        const ctx = c.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, c.width, c.height);
        currentStroke.current = [];
        allStrokes.current = [];
      },
      getImageData: () => {
        const c = canvasRef.current;
        if (!c) return null;
        const ctx = c.getContext("2d");
        if (!ctx) return null;
        return ctx.getImageData(0, 0, c.width, c.height);
      }
    }));

    useEffect(() => {
      const c = canvasRef.current;
      if (!c) return;
      const dpr = window.devicePixelRatio || 1;
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
    }, [size]);

    function getPos(e: PointerEvent) {
      const rect = canvasRef.current!.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    useEffect(() => {
      const c = canvasRef.current;
      if (!c) return;

      const onPointerDown = (ev: PointerEvent) => {
        drawing.current = true;
        try {
          c.setPointerCapture(ev.pointerId);
        } catch {}
        const pos = getPos(ev);
        last.current = pos;
        currentStroke.current = [pos];
      };

      const onPointerMove = (ev: PointerEvent) => {
        if (!drawing.current || !last.current) return;
        const p = getPos(ev);
        const ctx = c.getContext("2d");
        if (!ctx) return;
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
          if (onStrokeComplete) {
            onStrokeComplete(allStrokes.current);
          }
        }
        drawing.current = false;
        try {
          c.releasePointerCapture(ev.pointerId);
        } catch {}
        last.current = null;
        currentStroke.current = [];
      };

      c.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);

      return () => {
        c.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
      };
    }, [onStrokeComplete]);

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
          <line
            x1={width / 2}
            y1="0"
            x2={width / 2}
            y2={height}
            stroke="#f0f0f0"
            strokeWidth="1"
          />
          <line
            x1="0"
            y1={height / 2}
            x2={width}
            y2={height / 2}
            stroke="#f0f0f0"
            strokeWidth="1"
          />

          <line
            x1={width / 4}
            y1="0"
            x2={width / 4}
            y2={height}
            stroke="#f8f8f8"
            strokeWidth="1"
          />
          <line
            x1={(3 * width) / 4}
            y1="0"
            x2={(3 * width) / 4}
            y2={height}
            stroke="#f8f8f8"
            strokeWidth="1"
          />
          <line
            x1="0"
            y1={height / 4}
            x2={width}
            y2={height / 4}
            stroke="#f8f8f8"
            strokeWidth="1"
          />
          <line
            x1="0"
            y1={(3 * height) / 4}
            x2={width}
            y2={(3 * height) / 4}
            stroke="#f8f8f8"
            strokeWidth="1"
          />
        </svg>
      </div>
    );
  }
);